import { expect, test } from 'vitest'
import { stringPropertyDescriptor, stringPropertyFns, stringPropertyOptions } from '../src'
import { systemConfigurationFns } from '@cozemble/model-core'

test('required validation', () => {
  const systemConfig = systemConfigurationFns.empty()
  const requiredProperty = stringPropertyFns.newInstance('name', stringPropertyOptions.required)
  expect(stringPropertyDescriptor.validateValue(systemConfig, requiredProperty, null)).toEqual([
    'Required',
  ])
  expect(stringPropertyDescriptor.validateValue(systemConfig, requiredProperty, undefined)).toEqual(
    ['Required'],
  )
  expect(stringPropertyDescriptor.validateValue(systemConfig, requiredProperty, '')).toEqual([
    'Required',
  ])
  expect(
    stringPropertyDescriptor.validateValue(systemConfig, requiredProperty, 'Mike'),
  ).toHaveLength(0)
})
