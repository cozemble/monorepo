import {options} from "@cozemble/lang-util";
import {Property, PropertyOption} from "@cozemble/model-core";
import {stringPropertyRegistration} from "@cozemble/model-string-core";

export const propertyFns = {
    newInstance(...opts: PropertyOption[]): Property {
        return options.apply(stringPropertyRegistration.newProperty(), ...opts)
    }
}

export const propertyOptions = {
    named(name: string): PropertyOption {
        return property =>
            ({...property, name})
    }
}