import {
  compare,
  drop,
  dropFields,
  dropLast,
  dropNulls,
  ensureArray,
  equal,
  filterAsync,
  findMandatory,
  first,
  groupBy,
  isSubset,
  last,
  moveItem,
  removeItemAtIndex,
  repeat,
  replaceElement,
  secondLast,
  sortBy,
  splitLast,
  startsWith,
  tail,
  take,
  toMap,
  unique,
  uniqueBy,
} from './arrays.js'
import { mapOf, toObject } from './maps.js'
import { promiseOf, truthPoller } from './promises.js'
import {
  basename,
  camelcaseToSentenceCase,
  camelize,
  dirname,
  extractTerms,
  isUndefinedOrNullOrEmptyString,
  mask,
  paragraphs,
  snakeCase,
  splitAtFirst,
  stripHtml,
  toJsonCase,
} from './string.js'
import { getQueryParams } from './urls.js'
import { ErrorWithContext, mergeContext, mergeErrorContext, prependToMessage } from './errors.js'
import { Selectable } from './selections.js'
import {
  castValue,
  containsObject,
  dropKeys,
  dropKeysRecursive,
  keysAndValues,
  mapKeys,
  mapValues,
  merge,
  orderKeys,
  pick,
  sameJson,
  set,
  typeAwareEqual,
  walkTo,
} from './objects.js'
import { LinePredicate, TextBlockParser } from './TextBlockParser.js'
import { dates } from './dates.js'
import { random } from './random.js'
import { Debouncer } from './Debouncer.js'
import { Counter } from './Counter.js'
import { Stack } from './Stack.js'

export const arrays = {
  secondLast,
  isSubset,
  startsWith,
  toMap,
  moveItem,
  unique,
  uniqueBy,
  groupBy,
  equal,
  removeItemAtIndex,
  ensureArray,
  filterAsync,
  repeat,
  take,
  drop,
  replaceElement,
  dropLast,
  last,
  first,
  tail,
  dropNulls,
  findMandatory,
  compare,
  sortBy,
  dropFields,
  splitLast,
}

export const maps = {
  mapOf,
  toObject,
}
export const promises = {
  promiseOf,
  truthPoller,
}
export const urls = {
  getQueryParams,
}
export const errors = {
  mergeContext,
  mergeErrorContext,
  ErrorWithContext,
  prependToMessage,
}
const strings = {
  isUndefinedOrNullOrEmptyString,
  camelize,
  snakeCase,
  extractTerms,
  paragraphs,
  splitAtFirst,
  basename,
  dirname,
  camelcaseToSentenceCase,
  mask,
  stripHtml,
  toJsonCase,
}

export const objects = {
  pick,
  dropKeys,
  dropKeysRecursive,
  walkTo,
  mapKeys,
  sameJson,
  merge,
  typeAwareEqual,
  containsObject,
  set,
  orderKeys,
  keysAndValues,
  mapValues,
  castValue,
}

export type StringKeyedObject<T = any> = { [key: string]: T }
export type StringToString = { [key: string]: string }
export type NameAndValue<T = any> = { name: string; value: T }
export type IdLabelAndValue<T = any> = { id: string; label: string; value: T }
export type IdLabelSelectedAndValue<T = any> = {
  id: string
  label: string
  selected: boolean
  value: T
}
export type IdLabelAndType = { id: string; label: string; type: string }
export type IdNameAndType = { id: string; name: string; type: string }
export type NameValueAndType<V = any, T = string> = { name: string; value: V; type: T }

export function idLabelSelectedAndValue<T = any>(
  id: string,
  label: string,
  selected: boolean,
  value: T,
): IdLabelSelectedAndValue<T> {
  return { id, label, selected, value }
}

export function idLabelAndValue<T = any>(id: string, label: string, value: T): IdLabelAndValue<T> {
  return { id, label, value }
}

export function idLabelAndType(id: string, label: string, type: string): IdLabelAndType {
  return { id, label, type }
}

export function idAndLabel(id: string, label: string): IdAndLabel {
  return { id, label }
}

export function idNameAndType(id: string, name: string, type: string): IdNameAndType {
  return { id, name, type }
}

export function nameAndValue<T>(name: string, value: T): NameAndValue<T> {
  return { name, value }
}

export function nameValueAndType<V = any, T = string>(
  name: string,
  value: V,
  type: T,
): NameValueAndType<V, T> {
  return { name, value, type }
}

export interface IdAndValue<T = any> {
  id: string
  value: T
}

export function idAndValue<T>(id: string, value: T): IdAndValue<T> {
  return { id, value }
}

export type IdAndLabel = { id: string; label: string }
export type NameAndValuePairs<T = any> = NameAndValue<T>[]
export type VoidFunction<T> = (t: T) => void
export type OnError = VoidFunction<any>
export type VoidCallback = () => void
export type Closer = VoidCallback
export type Predicate<T = any> = (element: T) => boolean
export const always: Predicate = () => true
export const never: Predicate = () => false

export interface IdAndName {
  id: string
  name: string
}

export function idAndName(id: string, name: string): IdAndName {
  return { id, name }
}

export const noopVoidCallback = () => {}

export function mandatory<T>(value: T | null | undefined, absenceErrorString: string): T {
  if (value === null || value === undefined) {
    throw new Error(absenceErrorString)
  }
  return value
}

export function hasValue(value: any) {
  return !(value === null || value === undefined)
}

export interface Storage<T = string> {
  getItem(key: string): T | null

  setItem(key: string, value: T): void
}

export {
  ErrorWithContext,
  Selectable,
  strings,
  extractTerms,
  camelize,
  TextBlockParser,
  LinePredicate,
  dates,
  random,
  Debouncer,
  Counter,
  Stack,
}

export { numbers } from './numbers.js'

export { partial1, partial2 } from './partial.js'

export { JustErrorMessage, justErrorMessage, ErrorMessage, MaybeErrorMessage } from './errors.js'

export function identity<T = any>(t: T): T {
  return t
}

export {
  Bug,
  TypedError,
  ClientError,
  ErrorMessageAndCode,
  toTypedError,
  toClientError,
  toBug,
  clientErrorCode,
  clientError,
  errorMessageAndCode,
  ErrorCode,
  errorCode,
} from './errors.js'

export { CorrelatedRequest, CorrelatedSession, correlation } from './correlation.js'

export { uuids } from './uuids.js'

export { Option, options } from './options.js'

export { Clock, SystemClock, FixedClock, clock } from './clock.js'

export { HeadAndTail, headAndTailFns } from './HeadAndTail.js'

export { Value, value } from './value.js'

export { nanoids } from './nanoids.js'

export { UnsuccessfulOutcome, Outcome, SuccessfulOutcome, outcomeFns } from './outcomes.js'

export { time } from './time.js'
