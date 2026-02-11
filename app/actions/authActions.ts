// @ts-nocheck
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type ActionResult = {
  success: boolean;
  error?: string;
  user?: {
    role: string;
    department: string | null;
  };
};

export async function signIn(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Fetch user profile for redirect
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, department')
    .eq('id', authData.user.id)
    .single();

  revalidatePath('/', 'layout');
  return { 
    success: true, 
    user: profile ? { role: profile.role, department: profile.department } : null 
  };
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  const role = formData.get('role') as string;
  const department = formData.get('department') as string | null;

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  if (!authData.user) {
    return { success: false, error: 'Failed to create user' };
  }

  const { error: profileError } = await supabase.from('profiles').insert({
    id: authData.user.id,
    username,
    role,
    department: department || null,
  });

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  return { success: true };
}
