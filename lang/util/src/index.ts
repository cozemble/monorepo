import {
  compare,
  drop,
  dropLast,
  dropNulls,
  ensureArray,
  equal,
  filterAsync,
  findMandatory,
  first,
  groupBy,
  headAndTail,
  isSubset,
  last,
  moveItem,
  removeItemAtIndex,
  repeat,
  replaceElement,
  secondLast,
  sortBy,
  startsWith,
  tail,
  take,
  toMap,
  unique,
  uniqueBy,
} from './arrays'
import { mapOf, toObject } from './maps'
import { promiseOf, truthPoller } from './promises'
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
} from './string'
import { getQueryParams } from './urls'
import {
  bestGuessAtMessageForUser,
  ErrorWithContext,
  mergeContext,
  mergeErrorContext,
  prependToMessage,
} from './errors'
import { Selectable } from './selections'
import {
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
} from './objects'
import { LinePredicate, TextBlockParser } from './TextBlockParser'
import { dates } from './dates'
import { random } from './random'
import { Debouncer } from './Debouncer'
import { Counter } from './Counter'
import { Stack } from './Stack'

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
  headAndTail,
  dropLast,
  last,
  first,
  tail,
  dropNulls,
  findMandatory,
  compare,
  sortBy,
}

export { HeadAndTail } from './arrays'

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
  bestGuessAtMessageForUser,
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

export { numbers } from './numbers'

export { partial1, partial2 } from './partial'

export { JustErrorMessage, justErrorMessage, ErrorMessage, MaybeErrorMessage } from './errors'

export interface WrappedValue<T> {
  _type: 'wrapped.value'
  value: T
}

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
} from './errors'

export { CorrelatedRequest, CorrelatedSession, correlation } from './correlation'

export { uuids } from './uuids'

export { Option, options } from './options'

export { Clock, SystemClock, FixedClock, clock } from './clock'
