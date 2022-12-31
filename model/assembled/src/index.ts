import {propertyRegistry} from "@cozemble/model-core";
import {stringPropertyRegistration} from "@cozemble/model-string-core";
import {
    PropertyConfigurer as StringPropertyConfigurer,
    PropertyViewer as StringPropertyViewer,
    PropertyEditor as StringPropertyEditor
} from "@cozemble/model-string-ui";

export {propertyRegistry} from "@cozemble/model-core";

const propertyConfigurerMap = new Map<string, any>()
const propertyViewerMap = new Map<string, any>()
const propertyEditorMap = new Map<string, any>()

export const propertyConfigurerRegistry = {
    register: (propertyType: string, component: any) => {
        propertyConfigurerMap.set(propertyType, component)
    },
    get: (propertyType: string) => {
        return propertyConfigurerMap.get(propertyType) ?? null
    }
}

export const propertyViewerRegistry = {
    register: (propertyType: string, component: any) => {
        propertyViewerMap.set(propertyType, component)
    },
    get: (propertyType: string) => {
        return propertyViewerMap.get(propertyType) ?? null
    }
}

export const propertyEditorRegistry = {
    register: (propertyType: string, component: any) => {
        propertyEditorMap.set(propertyType, component)
    },
    get: (propertyType: string) => {
        return propertyEditorMap.get(propertyType) ?? null
    }
}

export function registerAllProperties() {
    propertyRegistry.register(stringPropertyRegistration)
}

export function registerAllPropertyConfigurers() {
    propertyConfigurerRegistry.register("string.property", StringPropertyConfigurer)
}

export function registerAllPropertyViewers() {
    propertyViewerRegistry.register("string.property", StringPropertyViewer)
}

export function registerAllPropertyEditors() {
    propertyEditorRegistry.register("string.property", StringPropertyEditor)
}
