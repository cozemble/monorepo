import type { StashPdfResponse } from '@cozemble/backend-aws-ocr-types'
import type { AwsOcrResponse } from '../aws-ocr/awsOcrTypes'

export interface UploadAndOcrResponse {
  upload: StashPdfResponse
  ocr: AwsOcrResponse
}
