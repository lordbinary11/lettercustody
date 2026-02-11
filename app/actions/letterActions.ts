// @ts-nocheck
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth';
import { getLetterById, getPendingMovement } from '@/lib/db';
import {
  canCreateLetter,
  canDispatchLetter,
  canReceiveLetter,
  canRejectLetter,
  canAddNote,
  canCompleteProcessing,
  canAttachPV,
  canForwardLetter,
} from '@/lib/permissions';
import {
  validateStateTransition,
  validateCustody,
} from '@/lib/stateMachine';
import {
  CreateLetterSchema,
  DispatchLetterSchema,
  ReceiveLetterSchema,
  RejectLetterSchema,
  AddProcessingNoteSchema,
  CompleteProcessingSchema,
  AttachPVSchema,
  ForwardLetterSchema,
} from '@/types/validation';
import { Department } from '@/types';

type ActionResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createLetter(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth();

    if (!canCreateLetter(user)) {
      return { success: false, error: 'Unauthorized: Only secretaries can create letters' };
    }

    const serialNumber = formData.get('serial_number') as string;
    const dateGenerated = formData.get('date_generated') as string;
    const dateMinuted = formData.get('date_minuted') as string;
    const amountStr = formData.get('amount') as string;

    const rawData = {
      serial_number: serialNumber?.trim() || null,
      subject: formData.get('subject'),
      date_generated: dateGenerated?.trim() || undefined,
      date_minuted: dateMinuted?.trim() || undefined,
      amount: amountStr?.trim() ? parseFloat(amountStr) : null,
    };

    const validated = CreateLetterSchema.parse(rawData);

    const supabase = await createClient();

    if (validated.serial_number) {
      const { data: existing } = await supabase
        .from('letters')
        .select('id')
        .eq('serial_number', validated.serial_number)
        .single();

      if (existing) {
        return { success: false, error: 'Serial number already exists' };
      }
    }

    const { data: letter, error } = await supabase
      .from('letters')
      .insert({
        serial_number: validated.serial_number,
        subject: validated.subject,
        date_generated: validated.date_generated,
        date_minuted: validated.date_minuted,
        amount: validated.amount,
        status: 'created',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/secretary');
    return { success: true, data: { id: letter.id } };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create letter' };
  }
}

export async function dispatchLetter(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const rawData = {
      letter_id: formData.get('letter_id'),
      to_department: formData.get('to_department'),
    };

    const validated = DispatchLetterSchema.parse(rawData);

    const letter = await getLetterById(validated.letter_id);
    if (!letter) {
      return { success: false, error: 'Letter not found' };
    }

    if (!canDispatchLetter(user, letter)) {
      return { success: false, error: 'Unauthorized: Cannot dispatch this letter' };
    }

    validateStateTransition(letter.status, 'dispatched', 'dispatch');

    const supabase = await createClient();

    const { error: movementError } = await supabase
      .from('movements')
      .insert({
        letter_id: validated.letter_id,
        from_department: letter.current_department,
        to_department: validated.to_department,
        dispatched_by: user.id,
        status: 'dispatched',
      });

    if (movementError) {
      return { success: false, error: movementError.message };
    }

    const { error: letterError } = await supabase
      .from('letters')
      .update({
        status: 'dispatched',
        current_department: validated.to_department,
      })
      .eq('id', validated.letter_id);

    if (letterError) {
      return { success: false, error: letterError.message };
    }

    revalidatePath('/dashboard/secretary');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to dispatch letter' };
  }
}

export async function receiveLetter(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const rawData = {
      movement_id: formData.get('movement_id'),
      letter_id: formData.get('letter_id'),
    };

    const validated = ReceiveLetterSchema.parse(rawData);

    const letter = await getLetterById(validated.letter_id);
    if (!letter) {
      return { success: false, error: 'Letter not found' };
    }

    if (!canReceiveLetter(user, letter)) {
      return { success: false, error: 'Unauthorized: Cannot receive this letter' };
    }

    validateStateTransition(letter.status, 'received', 'receive');
    validateCustody(letter.current_department, user.department, 'receive');

    const supabase = await createClient();

    const { error: movementError } = await supabase
      .from('movements')
      .update({
        status: 'received' as const,
        received_by: user.id,
        received_at: new Date().toISOString(),
      })
      .eq('id', validated.movement_id);

    if (movementError) {
      return { success: false, error: movementError.message };
    }

    const { error: letterError } = await supabase
      .from('letters')
      .update({
        status: 'processing' as const,
        date_received: new Date().toISOString(),
      })
      .eq('id', validated.letter_id);

    if (letterError) {
      return { success: false, error: letterError.message };
    }

    revalidatePath(`/dashboard/${user.department?.toLowerCase()}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to receive letter' };
  }
}

export async function rejectLetter(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const rawData = {
      movement_id: formData.get('movement_id'),
      letter_id: formData.get('letter_id'),
      rejection_reason: formData.get('rejection_reason'),
    };

    const validated = RejectLetterSchema.parse(rawData);

    const letter = await getLetterById(validated.letter_id);
    if (!letter) {
      return { success: false, error: 'Letter not found' };
    }

    if (!canRejectLetter(user, letter)) {
      return { success: false, error: 'Unauthorized: Cannot reject this letter' };
    }

    validateStateTransition(letter.status, 'rejected', 'reject');

    const supabase = await createClient();

    const { error: movementError } = await supabase
      .from('movements')
      .update({
        status: 'rejected' as const,
        received_by: user.id,
        received_at: new Date().toISOString(),
        rejection_reason: validated.rejection_reason,
      })
      .eq('id', validated.movement_id);

    if (movementError) {
      return { success: false, error: movementError.message };
    }

    const { error: letterError } = await supabase
      .from('letters')
      .update({
        status: 'created' as const,
        current_department: null,
      })
      .eq('id', validated.letter_id);

    if (letterError) {
      return { success: false, error: letterError.message };
    }

    revalidatePath(`/dashboard/${user.department?.toLowerCase()}`);
    revalidatePath('/dashboard/secretary');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to reject letter' };
  }
}

export async function addProcessingNote(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const rawData = {
      letter_id: formData.get('letter_id'),
      note: formData.get('note'),
    };

    const validated = AddProcessingNoteSchema.parse(rawData);

    const letter = await getLetterById(validated.letter_id);
    if (!letter) {
      return { success: false, error: 'Letter not found' };
    }

    if (!canAddNote(user, letter)) {
      return { success: false, error: 'Unauthorized: Cannot add note to this letter' };
    }

    validateCustody(letter.current_department, user.department, 'add_note');

    const supabase = await createClient();

    const { error } = await supabase
      .from('processing_notes')
      .insert({
        letter_id: validated.letter_id,
        department: user.department!,
        note: validated.note,
        created_by: user.id,
      } as const);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/${user.department?.toLowerCase()}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add note' };
  }
}

export async function completeProcessing(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const rawData = {
      letter_id: formData.get('letter_id'),
    };

    const validated = CompleteProcessingSchema.parse(rawData);

    const letter = await getLetterById(validated.letter_id);
    if (!letter) {
      return { success: false, error: 'Letter not found' };
    }

    if (!canCompleteProcessing(user, letter)) {
      return { success: false, error: 'Unauthorized: Cannot complete processing for this letter' };
    }

    validateStateTransition(letter.status, 'processed', 'complete_processing');
    validateCustody(letter.current_department, user.department, 'complete_processing');

    const supabase = await createClient();

    const { error } = await supabase
      .from('letters')
      .update({
        status: 'processed' as const,
      } as const)
      .eq('id', validated.letter_id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/${user.department?.toLowerCase()}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to complete processing' };
  }
}

export async function attachPV(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const rawData = {
      letter_id: formData.get('letter_id'),
      pv_id: formData.get('pv_id'),
    };

    const validated = AttachPVSchema.parse(rawData);

    const letter = await getLetterById(validated.letter_id);
    if (!letter) {
      return { success: false, error: 'Letter not found' };
    }

    if (!canAttachPV(user, letter)) {
      return { success: false, error: 'Unauthorized: Only Payables can attach PV' };
    }

    validateCustody(letter.current_department, user.department, 'attach_pv');

    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('letters')
      .select('id')
      .eq('pv_id', validated.pv_id)
      .single();

    if (existing && existing.id !== validated.letter_id) {
      return { success: false, error: 'PV ID already attached to another letter' };
    }

    const { error } = await supabase
      .from('letters')
      .update({
        pv_id: validated.pv_id,
      } as const)
      .eq('id', validated.letter_id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/payables');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to attach PV' };
  }
}

export async function forwardLetter(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();

    const rawData = {
      letter_id: formData.get('letter_id'),
      to_department: formData.get('to_department'),
    };

    const validated = ForwardLetterSchema.parse(rawData);

    const letter = await getLetterById(validated.letter_id);
    if (!letter) {
      return { success: false, error: 'Letter not found' };
    }

    if (!canForwardLetter(user, letter)) {
      return { success: false, error: 'Unauthorized: Cannot forward this letter' };
    }

    validateStateTransition(letter.status, 'forwarded', 'forward');
    validateCustody(letter.current_department, user.department, 'forward');

    const supabase = await createClient();

    const { error: movementError } = await supabase
      .from('movements')
      .insert({
        letter_id: validated.letter_id,
        from_department: letter.current_department,
        to_department: validated.to_department,
        dispatched_by: user.id,
        status: 'forwarded',
      });

    if (movementError) {
      return { success: false, error: movementError.message };
    }

    const { error: letterError } = await supabase
      .from('letters')
      .update({
        status: 'forwarded',
        current_department: validated.to_department,
      })
      .eq('id', validated.letter_id);

    if (letterError) {
      return { success: false, error: letterError.message };
    }

    revalidatePath(`/dashboard/${user.department?.toLowerCase()}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to forward letter' };
  }
}
