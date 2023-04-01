import type {
  DataRecord,
  DataRecordPropertyPath,
  Model,
  ModelHtmlTemplate,
  ModelId,
} from '@cozemble/model-core'
import type { ReferenceProperty } from '@cozemble/model-reference-core'
import { referencePropertyFns } from '@cozemble/model-reference-core'
import type { DataRecordEditorClient, DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import { applyTemplate, modelToJson } from '@cozemble/model-to-json'
import { modelFns } from '@cozemble/model-api'
import { strings } from '@cozemble/lang-util'

export interface EditorParams {
  referenceProperty: ReferenceProperty
  referencedModel: Model
  referencedModelId: ModelId
  summaryView: ModelHtmlTemplate
  models: Model[]
}

export function assembleEditorParams(
  client: DataRecordEditorClient | DataRecordViewerClient,
  recordPath: DataRecordPropertyPath,
): EditorParams {
  const referenceProperty = recordPath.lastElement as ReferenceProperty
  if (referenceProperty.propertyType.value !== 'reference.property') {
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
  const referencedModel = modelFns.findById(client.getModels(), referencedModelId)
  if (!summaryView) {
    throw new Error('No summary view for model ' + referencedModel.name.value)
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
    referencedModel,
    summaryView: summaryView.view.view,
    models: client.getModels(),
  }
}

export function makeSummaryView(record: DataRecord, params: EditorParams): string {
  return strings.stripHtml(
    applyTemplate(params.summaryView.template, modelToJson(params.models, record)),
  )
}
