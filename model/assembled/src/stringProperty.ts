import {uuids} from "@cozemble/lang-util";
import {Property, PropertyDescriptor} from "@cozemble/model-core";

export interface StringProperty extends Property {
    _type: "string.property"
}

export const stringPropertyRegistration: PropertyDescriptor<StringProperty> = {
    _type: "property.descriptor",
    id: "core.string.property",
    name: {_type: "dotted.name", name: "String"},
    newProperty: () => {
        return {_type: "string.property", id: uuids.v4(), name: ""}
    }
}