import type { RecordEditContext } from '$lib/RecordEditContext'
import type { DataRecordEditEvent } from '@cozemble/data-editor-sdk'

export interface EditRecordListener {
  beginEdit(context: RecordEditContext): void
  popEdit(): void

  onEvent(context: RecordEditContext, event: DataRecordEditEvent): void
}

const contextName = 'com.cozemble.data.editor.edit.record.listener'

export function setEditRecordListener(
  setContext: (key: string, object: any) => void,
  editRecordListener: EditRecordListener,
) {
  setContext(contextName, editRecordListener)
}

const nullEventListener: EditRecordListener = {
  beginEdit: () => {},
  popEdit: () => {},
  onEvent: () => {},
}

export function getEditRecordListener(getContext: (key: string) => any): EditRecordListener {
  return getContext(contextName) ?? nullEventListener
}
