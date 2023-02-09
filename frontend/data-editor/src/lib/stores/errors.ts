import type { ErrorObject } from 'ajv'

import { merge } from 'lodash'
import { writable } from 'svelte/store'

export const errors = writable({})

/** Create error message from Ajv error */
const createErrorMessage = (error: ErrorObject): Record<string, string> | string => {
  const { keyword, params } = error

  switch (keyword) {
    case 'required':
      return { [params.missingProperty]: 'Required' }
    default:
      return 'Invalid'
  }
}

/** Convert Ajv error to error object
 *
 * Example:
 * input: "/customers/0/addresses/0"
 * output: {
 *   customers: [
 *    {}, // as many {} as the number in the path to preserve index
 *     {
 *       addresses: [
 *         {}
 *       ]
 *     }
 *   ]
 * }
 */
const convertToErrorObject = (error: ErrorObject): Record<string, any> =>
  error.instancePath.split('/').reduceRight((prev, curr) => {
    if (curr === '') return prev

    // check if curr can be converted to a number
    if (Number.isInteger(Number(curr))) {
      const index = Number(curr)
      return Array(index + 1)
        .fill(undefined)
        .map((_, i) => {
          if (i === index) {
            return prev
          }
          return {}
        })
    }

    return { [curr]: prev }
  }, createErrorMessage(error) as Record<string, any>)

/** Add errors to the store */
export function addErrors(errorObjects: ErrorObject[] | null) {
  errors.update((prev) => {
    console.log('prev: ', prev)

    if (!errorObjects) return {}

    // convert error to error objects and merge them
    return merge({}, ...errorObjects.map(convertToErrorObject))
  })
}
