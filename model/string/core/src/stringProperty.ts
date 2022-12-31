import {Option, options, uuids} from "@cozemble/lang-util";
import {Property, PropertyDescriptor, propertyTypeFns} from "@cozemble/model-core";

export const stringPropertyType = propertyTypeFns.newInstance("string.property")

export interface RegexValidation {
    _type: "regex.validation"
    regex: string
    message: string
}

export interface StringProperty extends Property {
    _type: { _type: "property.type", type: "string.property" }
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
    propertyType: stringPropertyType,
    name: {_type: "dotted.name", name: "String"},
    validate,
    newProperty: () => {
        const id = uuids.v4()
        return {
            _type: {_type: "property.type", type: "string.property"},
            id,
            version: 1,
            name: "",
            required: false,
            unique: false,
            validations: [],
            randomValue: () => {
                return (Math.random() + 1).toString(36).substring(2)
            },
            setValue: (record, value) => {
                return {
                    ...record,
                    values: {
                        ...record.values,
                        [id]: value
                    }
                }
            },
            getValue: (record) => {
                return record.values[id] ?? null
            }
        }
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

export const stringProperties = {
    newInstance: (name: string, ...opts: StringPropertyOption[]): StringProperty => {
        return options.apply({...stringPropertyRegistration.newProperty(), name}, ...opts)
    }
}