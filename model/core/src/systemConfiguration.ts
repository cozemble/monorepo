export interface SystemConfiguration {
  _type: 'system.configuration'
  id: { value: string }
  name: { value: string }
}

export const systemConfigurationFns = {
  empty: (): SystemConfiguration => {
    return {
      _type: 'system.configuration',
      id: { value: 'system.configuration' },
      name: { value: 'system.configuration' },
    }
  },
}
