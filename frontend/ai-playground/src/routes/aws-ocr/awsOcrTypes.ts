import type { Page } from '@cozemble/backend-aws-ocr-types'

export interface AwsOcrResponse {
  json: { pages: Page[] }
  html: string
}
