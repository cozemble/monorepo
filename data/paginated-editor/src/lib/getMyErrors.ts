import type {
  DataRecordValuePath,
  DataRecordPathParentElement,
  Property,
} from '@cozemble/model-core'
import { dottedPathFns } from '@cozemble/model-core'
import { dataRecordValuePathFns } from '@cozemble/model-api'

export function getMyErrors(
  errors: Map<DataRecordValuePath, string[]>,
  parentPath: DataRecordPathParentElement[],
  property: Property,
): string[] {
  const path = dataRecordValuePathFns.newInstance(property, ...parentPath)
  const dottedPath = dataRecordValuePathFns.toDottedPath(path)
  const entries = errors.entries()
  for (const entry of entries) {
    const [path, messages] = entry
    const thisDottedPath = dataRecordValuePathFns.toDottedPath(path)
    if (dottedPathFns.equals(thisDottedPath, dottedPath)) {
      return messages
    }
  }
  return []
}
