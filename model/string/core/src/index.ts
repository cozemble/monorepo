import {propertyDescriptors} from '@cozemble/model-core'
import {registerModelEvents} from './events';
import {stringPropertyDescriptor} from "./stringPropertyDescriptor";

export {
    StringProperty,
    RegexValidation,
    stringPropertyFns,
    stringPropertyOptions,
    StringPropertyOption,
    stringPropertyType
} from './stringProperty'


export function registerStringProperty() {
    propertyDescriptors.register(stringPropertyDescriptor)
    propertyDescriptors.setDefault(stringPropertyDescriptor)
    registerModelEvents()
}

export {stringPropertyDescriptor} from "./stringPropertyDescriptor";

export {
    newStringPropertyModelEvent,
    NewStringPropertyModelEvent
} from './events';
