import type { Model, ModelHtmlTemplate, RecordAndEdges } from '@cozemble/model-core'
import { applyTemplate, modelToJson } from '@cozemble/model-to-json'
import type { EditorParams } from './editorHelper'

export function renderReference(
  record: RecordAndEdges | null,
  editorParams: EditorParams,
): string | null {
  return renderReferencedRecord(editorParams.models, record, editorParams.summaryView)
}

export function renderReferencedRecord(
  models: Model[],
  record: RecordAndEdges | null,
  summaryView: ModelHtmlTemplate,
) {
  if (!record) {
    return null
  }
  return applyTemplate(summaryView.template, modelToJson(models, record.record))
}
