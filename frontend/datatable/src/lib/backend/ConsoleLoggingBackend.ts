import type { Backend } from './Backend'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'

export class ConsoleLoggingBackend implements Backend {
  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    console.log('saveModel', model)
    return null
  }

  async saveModels(model: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    console.log('saveModels', model)
    return null
  }
}
