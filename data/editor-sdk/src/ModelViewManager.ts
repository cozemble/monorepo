import { ModelId, ModelView } from '@cozemble/model-core'
import { JustErrorMessage } from '@cozemble/lang-util'

type JustErrorMessage = typeof JustErrorMessage

export interface ModelViewManager {
  getModelViews(modelId: ModelId): ModelView[]
  saveModelView(modelView: ModelView): Promise<JustErrorMessage | null>
}
