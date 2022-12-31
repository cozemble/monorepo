import type {DataRecord} from "@cozemble/model-core";
import type {ValueChanged} from "@cozemble/model-editor-sdk";
import type {CellFocus} from "$lib/CellFocus";
import type {Writable} from "svelte/store";

export type UiMode = "navigate" | "edit"

function applyValueChangedToRecord(r: DataRecord, event: ValueChanged): DataRecord {
    return event.path.setValue(r, event.newValue)
}

export function applyValueChanged(records: DataRecord[], event: ValueChanged): DataRecord[] {
    return records.map(r => r.id.id === event.record.id.id ? applyValueChangedToRecord(r, event) : r)
}

export function modeFollowingValueChange(event: ValueChanged, mode: Writable<UiMode>, focus: Writable<CellFocus | null>) {
    if(event.confirmMethod === "Enter") {
        mode.set("navigate")
        focus.set(null)
    } else if(event.confirmMethod === "Tab") {
        focus.update(f => f ? {...f, column: f.column + 1} : null)
    }
}