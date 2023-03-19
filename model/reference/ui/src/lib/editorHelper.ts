import type {
  DataRecord,
  DataRecordPath,
  Model,
  ModelHtmlTemplate,
  ModelId,
} from '@cozemble/model-core'
import type { ReferenceProperty } from '@cozemble/model-reference-core'
import { referencePropertyFns } from '@cozemble/model-reference-core'
import type { DataRecordEditorClient } from '@cozemble/data-editor-sdk'
import { modelToJson } from '@cozemble/model-to-json'
import { applyTemplate } from '@cozemble/model-to-json/dist/esm'

export interface EditorParams {
  referenceProperty: ReferenceProperty
  referencedModelId: ModelId
  summaryView: ModelHtmlTemplate
  models: Model[]
}

export function assembleEditorParams(
  client: DataRecordEditorClient,
  recordPath: DataRecordPath,
): EditorParams {
  const referenceProperty = recordPath.lastElement as ReferenceProperty
  if (referenceProperty.propertyType.type !== 'reference.property') {
    throw new Error('Expected a reference property')
  }
  const referencedModelId = referencePropertyFns.oneReference(referenceProperty)
  if (!referencedModelId) {
    throw new Error('No referenced model')
  }
  const modelViews = client.getModelViews(referencedModelId)
  const summaryView = modelViews.find(
    (e) => e.modelId.value === referencedModelId.value && e.name.value === 'Summary View',
  )
  if (!summaryView) {
    throw new Error('No summary view')
  }
  if (summaryView.view._type !== 'summary.view') {
    throw new Error('Expected a summary view, got ' + summaryView.view._type + '')
  }
  if (summaryView.view.view._type !== 'model.html.template') {
    throw new Error('Expected a model html template, got ' + summaryView.view.view._type + '')
  }
  return {
    referenceProperty,
    referencedModelId,
    summaryView: summaryView.view.view,
    models: client.getModels(),
  }
}

export function makeSummaryView(record: DataRecord, params: EditorParams): string {
  return applyTemplate(params.summaryView.template, modelToJson(params.models, record))
}
