import type {DataRecord} from "@cozemble/model-core";
import type {CellFocus} from "$lib/CellFocus";
import type {Writable} from "svelte/store";
import type {DataRecordValueChanged} from "@cozemble/model-editor-sdk";

export type UiMode = "navigate" | "edit"

export function applyValueChangedToRecord(r: DataRecord, event: DataRecordValueChanged): DataRecord {
    return event.path.setValue(r, event.newValue)
}

export function applyValueChanged(records: DataRecord[], event: DataRecordValueChanged): DataRecord[] {
    return records.map(r => r.id.id === event.record.id.id ? applyValueChangedToRecord(r, event) : r)
}

export function modeFollowingValueChange(event: DataRecordValueChanged, mode: Writable<UiMode>, focus: Writable<CellFocus | null>) {
    if (event.confirmMethod === "Enter") {
        mode.set("navigate")
        focus.set(null)
    } else if (event.confirmMethod === "Tab") {
        focus.update(f => f ? {...f, column: f.column + 1} : null)
    }
}