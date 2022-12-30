import {propertyRegistry} from "@cozemble/model-core";
import {stringPropertyRegistration} from "@cozemble/model-string-core";
import {PropertyConfigurer as StringPropertyConfigurer} from "@cozemble/model-string-ui";

const propertyConfigurerMap = new Map<string, any>()

export const propertyConfigurerRegistry = {
    register: (propertyType: string, component: any) => {
        propertyConfigurerMap.set(propertyType, component)
    },
    get: (propertyType: string) => {
        return propertyConfigurerMap.get(propertyType) ?? null
    }
}

export {propertyRegistry} from "@cozemble/model-core";

export function registerAllProperties() {
    propertyRegistry.register(stringPropertyRegistration)
}

export function registerAllPropertyConfigurers() {
    propertyConfigurerRegistry.register("string.property", StringPropertyConfigurer)
}
