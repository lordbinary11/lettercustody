import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export type TypedSupabaseClient = SupabaseClient<Database>;

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
