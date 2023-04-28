import { systemConfigurationFns } from '@cozemble/model-core'
import { writable } from 'svelte/store'

export const systemConfiguration = writable(systemConfigurationFns.empty())
