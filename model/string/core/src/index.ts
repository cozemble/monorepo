import {propertyDescriptors} from '@cozemble/model-core'
import {stringPropertyDescriptor} from './stringProperty'

export {
    StringProperty,
    RegexValidation,
    stringPropertyDescriptor,
    stringProperties,
    stringPropertyOptions,
    StringPropertyOption,
    stringPropertyType
} from './stringProperty'


export function registerStringProperty() {
    propertyDescriptors.register(stringPropertyDescriptor)
}
