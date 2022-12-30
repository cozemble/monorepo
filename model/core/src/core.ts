export interface PropertyDescriptor<T = Property> {
    _type: "property.descriptor"
    id: string
    name: DottedName
    newProperty: () => T
}

export interface Property {
    _type: string
    id: string
    name: string
}

export interface ModelId {
    _type: "model.id"
    id: string
}

export interface Model {
    _type: "model"
    id: ModelId
    name: string
    properties: Property[]
}

export interface DataRecordId {
    _type: "data.record.id"
    id: string
}

export interface TimestampEpochMillis {
    _type: "timestamp.epoch.millis"
    value: number
}

export interface UserId {
    _type: "user.id"
    id: string
}

export interface DataRecord {
    _type: "data.record"
    modelId: ModelId
    id: DataRecordId
    createdMillis: TimestampEpochMillis
    updatedMillis: TimestampEpochMillis
    createdBy: UserId
    values: { [key: string]: any }
}

export interface DottedName {
    _type: "dotted.name"
    name: string
}

export const registeredProperties: PropertyDescriptor[] = []

export const propertyRegistry = {
    register: (descriptor: PropertyDescriptor) => {
        if (!registeredProperties.find(p => p.id === descriptor.id)) {
            registeredProperties.push(descriptor)
        }
    },
    list: () => {
        return registeredProperties
    }
}