import { writable, type Writable } from 'svelte/store'

export const tenantStore: Writable<Tenant | null> = writable(null)
