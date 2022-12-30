import {propertyRegistry} from "@cozemble/model-core";
import {stringPropertyRegistration} from "./stringProperty";

export function registerAllProperties() {
    propertyRegistry.register(stringPropertyRegistration)
}

export {propertyRegistry} from "@cozemble/model-core";
