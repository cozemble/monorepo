import {options} from "@cozemble/lang-util";
import {Property, PropertyOption} from "@cozemble/model-core";
import {stringPropertyFns} from "@cozemble/model-string-core";

export const propertyFns = {
    newInstance(...opts: PropertyOption[]): Property {
        return options.apply(stringPropertyFns.newInstance("Untitled property"), ...opts)
    }
}

export const propertyOptions = {
    named(name: string): PropertyOption {
        return property =>
            ({...property, name})
    }
}