import type { DataRecord, DataRecordValuePath, SystemConfiguration } from '@cozemble/model-core'
import type { AttachmentList } from '@cozemble/model-attachment-core'
import { dataRecordValuePathFns } from '@cozemble/model-api'

export function getAttachments(
  systemConfiguration: SystemConfiguration,
  recordPath: DataRecordValuePath,
  record: DataRecord,
): AttachmentList {
  const leafPath = dataRecordValuePathFns.newInstance(recordPath.lastElement)
  return (
    (dataRecordValuePathFns.getValue(systemConfiguration, leafPath, record) as AttachmentList) ?? {
      _type: 'attachment.list',
      attachmentReferences: [],
    }
  )
}
