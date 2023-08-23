import type { ComponentFinder } from './componentPolicy'
import type { ZodIssue } from 'zod'
import type { ErrorComponentFinder } from './componentPolicy'

export type Path = (string | number)[]

export function componentFinder(getContext: (key: string) => any): ComponentFinder {
  return getContext('component.finder')
}

export function errorComponentFinder(getContext: (key: string) => any): ErrorComponentFinder {
  return getContext('error.component.finder')
}

export function errorsAtPath(path: Path, errors: ZodIssue[]): ZodIssue[] {
  return errors.filter((error) => error.path.join('.') === path.join('.'))
}
