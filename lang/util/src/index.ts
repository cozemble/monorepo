import {
  chunk,
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
} from './arrays.ts'
import { mapOf, toObject } from './maps.ts'
import { promiseOf, truthPoller } from './promises.ts'
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
} from './string.ts'
import { getQueryParams } from './urls.ts'
import { ErrorWithContext, mergeContext, mergeErrorContext, prependToMessage } from './errors.ts'
import { Selectable } from './selections.ts'
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
} from './objects.ts'
import { type LinePredicate, TextBlockParser } from './TextBlockParser.ts'
import { dates } from './dates.ts'
import { random } from './random.ts'
import { Debouncer } from './Debouncer.ts'
import { Counter } from './Counter.ts'
import { Stack } from './Stack.ts'

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
  chunk,
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

export { numbers } from './numbers.ts'
 
export { partial1, partial2 } from './partial.ts'

export { type JustErrorMessage, justErrorMessage, type ErrorMessage, type MaybeErrorMessage } from './errors.ts'

export function identity<T = any>(t: T): T {
  return t
}

export type {
  Bug,
  TypedError,
  ClientError,
  ErrorMessageAndCode,
  ErrorCode,
} from './errors.ts'

export {
  toTypedError,
  toClientError,
  toBug,
  clientErrorCode,
  clientError,
  errorMessageAndCode,
  errorCode,
} from './errors.ts'

export { type CorrelatedRequest, type CorrelatedSession, correlation } from './correlation.ts'

export { uuids } from './uuids.ts'

export { type Option, options } from './options.ts'

export { type Clock, type SystemClock, type FixedClock, clock } from './clock.ts'

export { type HeadAndTail, headAndTailFns } from './HeadAndTail.ts'

export { type Value, value } from './value.ts'

export { nanoids } from './nanoids.ts'

export { type UnsuccessfulOutcome, type Outcome, type SuccessfulOutcome, outcomeFns } from './outcomes.ts'

export { time } from './time.ts'
