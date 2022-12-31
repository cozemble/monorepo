import {DataRecordPath, DataRecordPathElement, Property} from "@cozemble/model-core";

export const dataRecordPathFns = {
    newInstance: <T = any>(property: Property<T>, ...parentElements: DataRecordPathElement[]): DataRecordPath<T> => {
        return {
            _type: "data.record.path",
            parentElements,
            property,
            getValue: (record) => {
                if (parentElements.length > 0) {
                    throw new Error("Not implemented: dataRecordPaths with parent elements")
                }
                return property.getValue(record)
            },
            setValue: (record, value) => {
                if (parentElements.length > 0) {
                    throw new Error("Not implemented: dataRecordPaths with parent elements")
                }
                return property.setValue(record, value)
            }
        }
    }
}
