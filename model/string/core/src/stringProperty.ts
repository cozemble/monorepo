import {Option, options} from "@cozemble/lang-util";
import {Property, propertyTypeFns} from "@cozemble/model-core";
import {propertyIdFns} from "@cozemble/model-core";

export const stringPropertyType = propertyTypeFns.newInstance("string.property")


export interface RegexValidation {
    _type: "regex.validation"
    regex: string
    message: string
}

export interface StringProperty extends Property<string> {
    _type: { _type: "property.type", type: "string.property" }
    required: boolean
    unique: boolean
    validations: RegexValidation[]
}


export function emptyProperty(name: string): StringProperty {
    const id = propertyIdFns.newInstance()
    return {
        _type: {_type: "property.type", type: "string.property"},
        id,
        version: 1,
        name,
        required: false,
        unique: false,
        validations: []
    }
}

export type StringPropertyOption = Option<StringProperty>

const required: StringPropertyOption = (property) => {
    return {...property, required: true}
}

const unique: StringPropertyOption = (property) => {
    return {...property, unique: true}
}

const validation: (regex: string, message: string) => StringPropertyOption = (regex, message) => {
    return (property) => {
        return {
            ...property,
            validations: [...property.validations, {regex, message, _type: "regex.validation"}]
        }
    }
}
export const stringPropertyOptions = {
    required,
    unique,
    validation
}

export const stringPropertyFns = {
    newInstance: (name: string, ...opts: StringPropertyOption[]): StringProperty => {
        return options.apply({...emptyProperty(name), name}, ...opts)
    }
}