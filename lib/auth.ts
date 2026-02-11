import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Profile } from '@/types';

export async function getCurrentUser(): Promise<Profile | null> {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return profile;
}

export async function requireAuth(): Promise<Profile> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export async function requireRole(allowedRoles: string[]): Promise<Profile> {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard/unauthorized');
  }
  
  return user;
}

export async function requireDepartment(department: string): Promise<Profile> {
  const user = await requireAuth();
  
  if (user.department !== department) {
    throw new Error(`Unauthorized: You must belong to ${department} department`);
  }
  
  return user;
}
