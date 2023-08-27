import type { Path } from '$lib/containers/helper'
import type { FomIssue } from '$lib/fom/Fom'

export function errorsAtPath(path: Path, errors: FomIssue[]): FomIssue[] {
  return errors.filter((error) => error.path.join('.').startsWith(path.join('.')))
}
