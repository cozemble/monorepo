import type { Check } from '../errors'
import { alwaysTrue, conditionalErrorChecks } from '../errors'
import { derived } from 'svelte/store'
import { gettableWritable } from './GettableWritable'

export class EditableValue<T = string> {
  constructor(
    private readonly initialValue: T | null,
    private readonly conditionalErrorCheck: Check<T>,
    private readonly errorChecks: Check<T>[],
    public readonly value = gettableWritable(initialValue),
    private errorCache: string[] = [],
    public readonly errors = derived(value, (v) => {
      errorCache = conditionalErrorChecks(v, conditionalErrorCheck, ...errorChecks)
      return errorCache
    }),
  ) {}

  public get hasErrors(): boolean {
    return this.errorCache.length > 0
  }

  public get hasChanged(): boolean {
    return this.value.get() !== this.initialValue
  }
}

export const editableValueFns = {
  hasErrors(editableValues: EditableValue[]): boolean {
    return editableValues.some((v) => v.hasErrors)
  },
}

export function editableWithConditionalChecks<T = string>(
  initialValue: T | null,
  conditionalErrorCheck: Check<T>,
  ...errorChecks: Check<T>[]
): EditableValue<T> {
  return new EditableValue<T>(initialValue, conditionalErrorCheck, errorChecks)
}

export function editableWithChecks<T = string>(
  initialValue: T | null,
  ...errorChecks: Check<T>[]
): EditableValue<T> {
  return new EditableValue<T>(initialValue, alwaysTrue(), errorChecks)
}
