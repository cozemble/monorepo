import type {
  DataRecord,
  DataRecordValuePath,
  Model,
  ModelHtmlTemplate,
  ModelId,
  ModelReference,
} from '@cozemble/model-core'
import { modelReferenceFns } from '@cozemble/model-core'
import type { DataRecordEditorClient, DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import { type UserInstruction, userInstructionFns } from '@cozemble/data-editor-sdk'
import { applyTemplate, modelToJson } from '@cozemble/model-to-json'
import { modelFns } from '@cozemble/model-api'
import { strings } from '@cozemble/lang-util'

export interface EditorParams {
  _type: 'editor.params'
  modelReference: ModelReference
  referencedModel: Model
  referencedModelId: ModelId
  summaryView: ModelHtmlTemplate
  models: Model[]
}

export function assembleEditorParams(
  client: DataRecordEditorClient | DataRecordViewerClient,
  recordPath: DataRecordValuePath,
): EditorParams | UserInstruction {
  const modelReference = recordPath.lastElement as ModelReference
  if (modelReference._type !== 'model.reference') {
    throw new Error('Expected a model reference')
  }
  const referencedModelId = modelReferenceFns.oneReference(modelReference)
  if (!referencedModelId) {
    throw new Error('No referenced model id')
  }
  const modelViews = client.getModelViews(referencedModelId)
  const summaryView = modelViews.find(
    (e) => e.modelId.value === referencedModelId.value && e.name.value === 'Summary View',
  )
  console.log({ modelViews, summaryView })
  const referencedModel = modelFns.findById(client.getModels(), referencedModelId)
  if (!referencedModel) {
    throw new Error('No referenced model')
  }
  if (!summaryView) {
    return userInstructionFns.setupSummaryView(
      'No summary view configured for model ' + referencedModel.name.value,
      referencedModel.name,
    )
  }
  if (summaryView.view._type !== 'summary.view') {
    throw new Error('Expected a summary view, got ' + summaryView.view._type + '')
  }
  if (summaryView.view.view._type !== 'model.html.template') {
    throw new Error('Expected a model html template, got ' + summaryView.view.view._type + '')
  }
  return {
    _type: 'editor.params',
    modelReference,
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
