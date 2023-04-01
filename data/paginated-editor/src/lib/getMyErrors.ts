import type { DataRecordPathParentElement, DataRecordValuePath } from '@cozemble/model-core'
import { dottedPathFns } from '@cozemble/model-core'
import { dataRecordValuePathFns } from '@cozemble/model-api'
import type { LeafModelSlot } from '@cozemble/model-core'

export function getMyErrors(
  errors: Map<DataRecordValuePath, string[]>,
  parentPath: DataRecordPathParentElement[],
  slot: LeafModelSlot,
): string[] {
  const path = dataRecordValuePathFns.newInstance(slot, ...parentPath)
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
