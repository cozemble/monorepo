import { expect, test } from 'vitest'
import { modelFns, modelOptions, propertyFns, nestedModelFns } from '../../src/index.js'
import { modelPathFns } from '../../src/modelPathFns.js'

test('an empty model has no paths', () => {
  const model = modelFns.newInstance('Empty')
  expect(modelFns.allPaths([model], model)).toEqual([])
})

test('a model with two top level properties ', () => {
  const model = modelFns.newInstance(
    'Customer',
    modelOptions.withProperties(
      propertyFns.newInstance('First name'),
      propertyFns.newInstance('Last name'),
    ),
  )
  const [firstName, lastName] = model.slots
  expect(modelFns.allPaths([model], model)).toEqual([
    modelPathFns.newInstance(firstName),
    modelPathFns.newInstance(lastName),
  ])
})

test('a model with two two relationships containing two properties each', () => {
  const addressModel = modelFns.newInstance(
    'Address',
    modelOptions.withProperties(
      propertyFns.newInstance('Street'),
      propertyFns.newInstance('Postcode'),
    ),
  )
  const [street, postcode] = addressModel.slots

  const summaryModel = modelFns.newInstance(
    'Summary',
    modelOptions.withProperties(
      propertyFns.newInstance('Preferences'),
      propertyFns.newInstance('Summary'),
    ),
  )
  const [preferences, summary] = summaryModel.slots
  const addressRelationship = nestedModelFns.newInstance('address', addressModel.id, 'one')
  const summaryRelationship = nestedModelFns.newInstance('summary', summaryModel.id, 'one')
  const customerModel = modelFns.newInstance(
    'Customer',
    modelOptions.withNestedModels(addressRelationship, summaryRelationship),
  )
  expect(modelFns.allPaths([addressModel, summaryModel], customerModel)).toEqual([
    modelPathFns.newInstance(street, addressRelationship),
    modelPathFns.newInstance(postcode, addressRelationship),
    modelPathFns.newInstance(preferences, summaryRelationship),
    modelPathFns.newInstance(summary, summaryRelationship),
  ])
})
