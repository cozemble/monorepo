import { writable, type Writable } from 'svelte/store'

export const navbarState: Writable<string | null> = writable(null)
