import { ModelId, ModelView } from '@cozemble/model-core'
import { JustErrorMessage } from '@cozemble/lang-util'

export interface ModelViewManager {
  getModelViews(modelId: ModelId): ModelView[]
  saveModelView(modelView: ModelView): Promise<JustErrorMessage | null>
}
