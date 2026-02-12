import { LetterStatus, Department } from '@/types';

export type StateTransition = {
  from: LetterStatus;
  to: LetterStatus;
  action: string;
  requiresCustody?: boolean;
};

export const VALID_TRANSITIONS: StateTransition[] = [
  { from: 'new', to: 'dispatched', action: 'dispatch', requiresCustody: false },
  { from: 'dispatched', to: 'processing', action: 'accept', requiresCustody: true },
  { from: 'dispatched', to: 'rejected', action: 'reject', requiresCustody: true },
  { from: 'forwarded', to: 'processing', action: 'accept', requiresCustody: true },
  { from: 'forwarded', to: 'rejected', action: 'reject', requiresCustody: true },
  { from: 'processing', to: 'processed', action: 'complete_processing', requiresCustody: true },
  { from: 'processed', to: 'forwarded', action: 'forward', requiresCustody: true },
  { from: 'processed', to: 'archived', action: 'archive', requiresCustody: true },
  { from: 'rejected', to: 'new', action: 'return_to_secretary', requiresCustody: false },
];

export function isValidTransition(from: LetterStatus, to: LetterStatus): boolean {
  return VALID_TRANSITIONS.some(
    (transition) => transition.from === from && transition.to === to
  );
}

export function getValidNextStates(currentStatus: LetterStatus): LetterStatus[] {
  return VALID_TRANSITIONS
    .filter((transition) => transition.from === currentStatus)
    .map((transition) => transition.to);
}

export function validateStateTransition(
  currentStatus: LetterStatus,
  nextStatus: LetterStatus,
  action: string
): void {
  const transition = VALID_TRANSITIONS.find(
    (t) => t.from === currentStatus && t.to === nextStatus && t.action === action
  );

  if (!transition) {
    throw new Error(
      `Invalid state transition: Cannot ${action} from ${currentStatus} to ${nextStatus}`
    );
  }
}

export function getNextStatusForAction(
  currentStatus: LetterStatus,
  action: string
): LetterStatus {
  const transition = VALID_TRANSITIONS.find(
    (t) => t.from === currentStatus && t.action === action
  );

  if (!transition) {
    throw new Error(
      `Invalid action: Cannot perform ${action} on letter with status ${currentStatus}`
    );
  }

  return transition.to;
}

export function requiresCustody(from: LetterStatus, to: LetterStatus): boolean {
  const transition = VALID_TRANSITIONS.find(
    (t) => t.from === from && t.to === to
  );
  return transition?.requiresCustody ?? false;
}

export function validateCustody(
  letterDepartment: Department | null,
  userDepartment: Department | null,
  action: string
): void {
  if (!letterDepartment) {
    if (action !== 'dispatch') {
      throw new Error('Letter has no custody assignment');
    }
    return;
  }

  if (letterDepartment !== userDepartment) {
    throw new Error(
      `Custody violation: Letter is with ${letterDepartment}, but you are in ${userDepartment}`
    );
  }
}

export const LETTER_STATUS_LABELS: Record<LetterStatus, string> = {
  new: 'New',
  dispatched: 'Dispatched',
  forwarded: 'Forwarded',
  processing: 'Processing',
  processed: 'Processed',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const LETTER_STATUS_COLORS: Record<LetterStatus, string> = {
  new: 'bg-gray-100 text-gray-800',
  dispatched: 'bg-blue-100 text-blue-800',
  forwarded: 'bg-indigo-100 text-indigo-800',
  processing: 'bg-purple-100 text-purple-800',
  processed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  archived: 'bg-slate-100 text-slate-800',
};
