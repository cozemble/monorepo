import { expect, test } from 'vitest'
import { modelFns, modelOptions } from '@cozemble/model-api'
import { useSameSlotIds } from '../src/lib/generative/useSameSlotIds'
import { nestedModelFns } from '@cozemble/model-api/dist/esm'

test('nothing to do if model lists are empty', () => {
  const converted = useSameSlotIds([], [])
  expect(converted).toEqual([])
})

test('nothing to do if the from model list is empty', () => {
  const model = modelFns.newInstance('X')
  const converted = useSameSlotIds([], [model])
  expect(converted).toEqual([model])
})

test('nothing to do it the models are the same', () => {
  const model = modelFns.newInstance('X')
  const converted = useSameSlotIds([model], [model])
  expect(converted).toEqual([model])
})

test('nothing to do if the from model contains no slots in the to model', () => {
  const from = [modelFns.newInstance('From', modelOptions.withProperty('A'))]
  const to = [modelFns.newInstance('To', modelOptions.withProperty('B'))]
  const converted = useSameSlotIds(from, to)
  expect(converted).toEqual(to)
})

test('nothing to do if the from model names are not the same as the to model names', () => {
  const from = [modelFns.newInstance('From', modelOptions.withProperty('A'))]
  const to = modelFns.newInstance('To', modelOptions.withProperty('A'))
  const converted = useSameSlotIds(from, [to])
  expect(converted).toEqual([to])
})

test('use the property id in the from model if there is a slot in the to model with the same name', () => {
  const from = [modelFns.newInstance('Model', modelOptions.withProperty('A'))]
  const to = modelFns.newInstance(
    'Model',
    modelOptions.withProperty('A'),
    modelOptions.withProperty('B'),
  )
  const converted = useSameSlotIds(from, [to])
  expect(converted).toEqual([
    { ...to, slots: [{ ...to.slots[0], id: from[0].slots[0].id }, to.slots[1]] },
  ])
})
