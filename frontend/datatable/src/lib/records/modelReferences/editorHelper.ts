import type {
  DataRecord,
  DataRecordValuePath,
  Id,
  Model,
  ModelHtmlTemplate,
  ModelId,
  ModelReference,
  ModelReferenceId,
  ModelView,
} from '@cozemble/model-core'
import { modelReferenceFns, recordGraphEdgeFns } from '@cozemble/model-core'
import type {
  DataRecordEditorClient,
  DataRecordViewerClient,
  RecordGraphModifier,
} from '@cozemble/data-editor-sdk'
import { type UserInstruction, userInstructionFns } from '@cozemble/data-editor-sdk'
import { applyTemplate, modelToJson } from '@cozemble/model-to-json'
import { modelFns } from '@cozemble/model-api'
import { strings } from '@cozemble/lang-util'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'
import { timestampedRecordGraphEdgeFns } from '@cozemble/model-event-sourced'

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
  modelViews: ModelView[],
): EditorParams | UserInstruction {
  const modelReference = recordPath.lastElement as ModelReference
  if (modelReference._type !== 'model.reference') {
    throw new Error('Expected a model reference')
  }
  const referencedModelId = modelReferenceFns.getReferencedModelId(modelReference)
  if (!referencedModelId) {
    throw new Error('No referenced model id')
  }
  const summaryView = modelViews.find(
    (e) => e.modelId.value === referencedModelId.value && e.name.value === 'Summary View',
  )
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

export function inverseReferenceSetter(
  edgeId: Id,
  targetModelId: ModelId, // e.g.booking
  modelReferenceId: ModelReferenceId, // the reference binding the two models
  originatingRecord: DataRecord, // customer
): RecordGraphModifier {
  return (graph: EventSourcedRecordGraph): EventSourcedRecordGraph => {
    const createdRecord = getCreatedRecord(graph, targetModelId)
    return {
      ...graph,
      relatedRecords: [originatingRecord],
      edges: [
        timestampedRecordGraphEdgeFns.newInstance(
          recordGraphEdgeFns.newInstance(
            modelReferenceId,
            originatingRecord.modelId,
            createdRecord.modelId,
            originatingRecord.id,
            createdRecord.id,
            edgeId,
          ),
        ),
      ],
    }
  }
}

export function getCreatedRecord(
  graph: EventSourcedRecordGraph,
  targetModelId: ModelId,
): DataRecord {
  const recordsOfReferencedModel = graph.records.filter(
    (r) => r.record.modelId.value === targetModelId.value,
  )
  if (recordsOfReferencedModel.length !== 1) {
    throw new Error(
      `Expected to find exactly one record of model ${targetModelId.value} but found ${recordsOfReferencedModel.length}`,
    )
  }
  return recordsOfReferencedModel[0].record
}
