import type { Database } from '$lib/types/database.types'
import { SupabaseClient, Session } from '@supabase/supabase-js'

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    interface Locals {
      /**  +hooks.server.ts */
      supabase: SupabaseClient
      /**  +hooks.server.ts */
      getSession(): Promise<Session | null>
    }

    interface LayoutData {
      /** routes/+layout.server.ts */
      session: Session | null
    }

    interface PageData {
      /**  routes/+layout.ts */
      session: Session | null
      /**  routes/+layout.ts */
      supabase: SupabaseClient<Database>
    }

    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }
}

export {}
