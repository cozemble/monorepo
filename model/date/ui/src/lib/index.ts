import type { SlotSystemConfigurationDescriptor } from '@cozemble/model-core'
import { slotSystemConfigurationDescriptors } from '@cozemble/model-core'
import DateSystemConfigurationComponent from './DateSystemConfigurationComponent.svelte'

export { default as PropertyConfigurer } from './DatePropertyConfigurer.svelte'
export { default as PropertyViewer } from './SimplerDatePropertyViewer.svelte'
export { default as PropertyEditor } from './DatePropertyEditor.svelte'

export const datePropertySystemConfigurationDescriptor: SlotSystemConfigurationDescriptor = {
  _type: 'slot.system.configuration.descriptor',
  slotType: 'date.property',
  defaultValues: () => {
    return {
      dateFormat: 'yyyy-MM-dd',
      timezone: 'UTC',
    }
  },
  editorComponent: async () => {
    return DateSystemConfigurationComponent
  },
  validateValue: async (_value) => {
    return new Map()
  },
}

export function registerDateSystemConfiguration() {
  slotSystemConfigurationDescriptors.register(datePropertySystemConfigurationDescriptor)
}
