import type { RecordAndEdges } from '@cozemble/model-core'
import { applyTemplate, modelToJson } from '@cozemble/model-to-json'
import type { EditorParams } from './editorHelper'

export function renderReference(
  recordAndEdges: RecordAndEdges | null,
  editorParams: EditorParams,
): string | null {
  if (!recordAndEdges) {
    return null
  }
  return applyTemplate(
    editorParams.summaryView.template,
    modelToJson(editorParams.models, recordAndEdges.record),
  )
}
