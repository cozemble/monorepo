import { modelNameFns } from '@cozemble/model-core'
import { expect, test } from 'vitest'
import { coreModelEvents, eventSourcedModelFns } from '../../src/index.js'

test('addEvent applies the insertion order to each event', () => {
  let model = eventSourcedModelFns.newInstance(modelNameFns.newInstance('my model'))
  const renameEvent = coreModelEvents.modelRenamed(
    model.model.id,
    modelNameFns.newInstance('new name'),
  )
  model = eventSourcedModelFns.addEvent(model, renameEvent)
  expect(model.events).toHaveLength(2)
  expect(model.events[0].insertionOrder).toEqual(0)
  expect(model.events[1].insertionOrder).toEqual(1)
})
