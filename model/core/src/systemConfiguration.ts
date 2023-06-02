export interface SlotConfiguration<T = any> {
  _type: 'slot.configuration'
  slotType: string
  configuration: T
}

export const slotConfigurationFns = {
  newInstance: (slotType: string, configuration: any): SlotConfiguration => {
    return {
      _type: 'slot.configuration',
      slotType,
      configuration,
    }
  },
}

export interface SystemConfiguration {
  _type: 'system.configuration'
  id: { value: string }
  name: { value: string }
  slotConfiguration: { [slotType: string]: SlotConfiguration }
}

export const systemConfigurationFns = {
  empty: (): SystemConfiguration => {
    return {
      _type: 'system.configuration',
      id: { value: 'system.configuration' },
      name: { value: 'system.configuration' },
      slotConfiguration: {},
    }
  },
}

export interface SlotSystemConfigurationDescriptor<T = any> {
  _type: 'slot.system.configuration.descriptor'
  slotType: string
  defaultValues: () => T
  validateValue: (v: T) => Promise<Map<string, string[]>>
  editorComponent: () => Promise<any>
}

const slotSystemConfigurationDescriptorRegistry = new Map<
  string,
  SlotSystemConfigurationDescriptor
>()

export const slotSystemConfigurationDescriptors = {
  register: function (descriptor: SlotSystemConfigurationDescriptor) {
    slotSystemConfigurationDescriptorRegistry.set(descriptor.slotType, descriptor)
  },
  get: function (slotType: string): SlotSystemConfigurationDescriptor | null {
    return slotSystemConfigurationDescriptorRegistry.get(slotType) ?? null
  },
  list: function (): SlotSystemConfigurationDescriptor[] {
    return Array.from(slotSystemConfigurationDescriptorRegistry.values())
  },
}
