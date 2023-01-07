import { expect, test } from 'vitest'
import { stringPropertyDescriptor, stringPropertyFns, stringPropertyOptions } from '../src'

test('required validation', () => {
  const requiredProperty = stringPropertyFns.newInstance('name', stringPropertyOptions.required)
  expect(stringPropertyDescriptor.validateValue(requiredProperty, null)).toEqual(['Required'])
  expect(stringPropertyDescriptor.validateValue(requiredProperty, undefined)).toEqual(['Required'])
  expect(stringPropertyDescriptor.validateValue(requiredProperty, '')).toEqual(['Required'])
  expect(stringPropertyDescriptor.validateValue(requiredProperty, 'Mike')).toHaveLength(0)
})
