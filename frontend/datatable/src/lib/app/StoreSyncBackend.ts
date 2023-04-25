import type { Backend } from '../backend/Backend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { allModels } from '../stores/allModels'

export class StoreSyncBackend implements Backend {
  constructor(private readonly delegate: Backend) {}

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    const result = this.delegate.saveModel(model)
    console.log({ result })
    if (result === null) {
      allModels.update((ms) => {
        const index = ms.findIndex((m) => m.model.id.value === model.model.id.value)
        if (index === -1) {
          return [...ms, model]
        }
        const newMs = [...ms]
        newMs[index] = model
        return newMs
      })
    }
    return result
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    return this.delegate.saveModels(models)
  }
}
