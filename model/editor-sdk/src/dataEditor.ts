import {getContext, setContext} from 'svelte';
import {DataRecord, DataRecordPath} from "@cozemble/model-core";

const dataEditorClientContext = "com.cozemble.data.editor.client.context";

export interface EditAborted {
    _type: "edit.aborted"
    record: DataRecord
    path: DataRecordPath
}

export interface ValueChanged<T = any> {
    _type: "value.changed"
    record: DataRecord
    path: DataRecordPath
    oldValue: T | null
    newValue: T | null
    confirmMethod: "Enter" | "Tab" | null
}

export type DataEditorEvent = EditAborted | ValueChanged

export const dataEditorEvents = {
    editAborted(record: DataRecord, path: DataRecordPath): EditAborted {
        return {
            _type: "edit.aborted",
            record,
            path
        }
    },
    valueChanged<T>(record: DataRecord, path: DataRecordPath, oldValue: T | null, newValue: T | null, confirmMethod: "Enter" | "Tab" | null): ValueChanged<T> {
        return {
            _type: "value.changed",
            record,
            path,
            oldValue,
            newValue,
            confirmMethod
        }
    }
}

export interface DataEditorClient {
    dispatchEditEvent(event: DataEditorEvent): void
}

export const dataEditor = {
    getClient: (): DataEditorClient => {
        return getContext(dataEditorClientContext)
    }
}

export const dataEditorHost = {
    setClient: (client: DataEditorClient) => {
        return setContext(dataEditorClientContext, client)
    }
}