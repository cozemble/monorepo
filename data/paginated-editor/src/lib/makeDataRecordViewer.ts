import type { PaginatedEditorHost } from './PaginatedEditorHost'
import type { DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { Model, ModelView } from '@cozemble/model-core'

export function makeDataRecordViewer(
  models: Model[],
  modelViews: ModelView[],
  paginatedEditorHost: PaginatedEditorHost,
): DataRecordViewerClient {
  return {
    getModelViews: () => modelViews,
    getModels: () => models,
    recordById: paginatedEditorHost.recordById,
  }
}
