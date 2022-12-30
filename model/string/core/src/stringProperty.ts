import {uuids} from "@cozemble/lang-util";
import {Property, PropertyDescriptor} from "@cozemble/model-core";

export interface RegexValidation {
    _type: "regex.validation"
    regex: string
    message: string
}

export interface StringProperty extends Property {
    _type: "string.property"
    required: boolean
    unique: boolean
    validations: RegexValidation[]
}

function validate(property: StringProperty): Map<string, string> {
    const errors = new Map<string, string>()
    property.validations.forEach((validation, index) => {
        if (validation.regex.trim().length === 0) {
            errors.set(`validations.${index}.regex`, "Required")
        } else {
            try {
                new RegExp(validation.regex)
            } catch (e: any) {
                errors.set(`validations.${index}.regex`, e.message)
            }
        }
        if (validation.message.trim().length === 0) {
            errors.set(`validations.${index}.message`, "Required")
        }
    })
    return errors
}

export const stringPropertyRegistration: PropertyDescriptor<StringProperty> = {
    _type: "property.descriptor",
    id: "core.string.property",
    name: {_type: "dotted.name", name: "String"},
    validate,
    newProperty: () => {
        return {
            _type: "string.property",
            id: uuids.v4(),
            name: "",
            required: false,
            unique: false,
            validations: []
        }
    }
}