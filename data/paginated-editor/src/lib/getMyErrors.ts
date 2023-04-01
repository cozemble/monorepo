import type {
  DataRecordPropertyPath,
  DataRecordPathParentElement,
  Property,
} from '@cozemble/model-core'
import { dottedPathFns } from '@cozemble/model-core'
import { dataRecordPathFns } from '@cozemble/model-api'

export function getMyErrors(
  errors: Map<DataRecordPropertyPath, string[]>,
  parentPath: DataRecordPathParentElement[],
  property: Property,
): string[] {
  const path = dataRecordPathFns.newInstance(property, ...parentPath)
  const dottedPath = dataRecordPathFns.toDottedPath(path)
  const entries = errors.entries()
  for (const entry of entries) {
    const [path, messages] = entry
    const thisDottedPath = dataRecordPathFns.toDottedPath(path)
    if (dottedPathFns.equals(thisDottedPath, dottedPath)) {
      return messages
    }
  }
  return []
}
