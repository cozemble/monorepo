import { writable, type Writable } from 'svelte/store'

// @ts-ignore
export const tenantStore: Writable<Tenant | null> = writable(null)
