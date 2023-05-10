import type { DataRecordEditorClient } from '@cozemble/data-editor-sdk'
import { mandatory } from '@cozemble/lang-util'
import { getContext, setContext } from 'svelte'
import type { RecordErrorMap } from './helpers'
import type { Readable } from 'svelte/store'
import { readable } from 'svelte/store'
import type { CombinedDataRecordEditorClient } from './makeCombinedDataRecordEditorClient'

const singleRecordErrorContext = 'single.record.context.record.errors'
const singleRecordErrorVisibilityContext = 'single.record.context.record.error.visibility.context'
const recordEditorClientContext = 'com.cozemble.data.record.editor.client.context'
const recordViewerClientContext = 'com.cozemble.data.record.viewer.client.context'

const singleRecordRootRecordIndexContext = 'single.record.context.root.record.index'

export const singleRecordEditContext = {
  optionalRecordEditorClient(): DataRecordEditorClient | null {
    return getContext(recordEditorClientContext) || null
  },
  getRecordEditorClient(): DataRecordEditorClient {
    return mandatory(this.optionalRecordEditorClient(), 'Record editor client not found')
  },
  getErrorsForRecord(): Readable<RecordErrorMap> {
    return (this.optionalErrorsForRecord() ?? readable(new Map())) as Readable<RecordErrorMap>
  },
  getErrorVisibilityForRecord(): Readable<boolean> {
    return mandatory(
      getContext(singleRecordErrorVisibilityContext),
      'Record error visibility not found',
    )
  },
  setCombinedClient(combinedClient: CombinedDataRecordEditorClient) {
    setContext(recordEditorClientContext, combinedClient)
    setContext(recordViewerClientContext, combinedClient)
  },
  optionalRootRecordIndex(): number | null {
    return getContext(singleRecordRootRecordIndexContext) ?? null
  },
  setRootRecordIndex(rootRecordIndex: number) {
    setContext(singleRecordRootRecordIndexContext, rootRecordIndex)
  },
  optionalErrorsForRecord(): Readable<RecordErrorMap> | null {
    return getContext(singleRecordErrorContext) ?? null
  },
  setErrorsForRecord(errors: Readable<RecordErrorMap>) {
    setContext(singleRecordErrorContext, errors)
  },
  optionalErrorVisibilityForRecord() {
    return getContext(singleRecordErrorVisibilityContext) ?? null
  },
  setErrorVisibilityForRecord(errorVisibility: Readable<boolean>) {
    setContext(singleRecordErrorVisibilityContext, errorVisibility)
  },
}
