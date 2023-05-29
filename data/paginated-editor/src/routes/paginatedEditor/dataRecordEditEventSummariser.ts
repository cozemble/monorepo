import type { DataRecordEditEvent } from '@cozemble/model-event-sourced'
import { dataRecordPathElementFns, dataRecordValuePathFns } from '@cozemble/model-api'

export function dataRecordEditEventSummariser(editEvent: DataRecordEditEvent): string | null {
  if (editEvent._type === 'data.record.value.changed') {
    const path = dataRecordValuePathFns.toDottedPath(editEvent.path, 'name').value
    return `changed ${path} from ${editEvent.oldValue} to ${editEvent.newValue}`
  }
  if (editEvent._type === 'data.record.has.many.item.added') {
    const parentPath = dataRecordPathElementFns.toDottedNamePath(editEvent.parentPath).value
    const path =
      parentPath === ''
        ? editEvent.nestedModel.name.value
        : `${parentPath}.${editEvent.nestedModel.name.value}`
    return `Added item to ${path}`
  }
  return null
}
