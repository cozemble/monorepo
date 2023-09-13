export interface Line {
  _type: 'line'
  text: string
}

export interface Row {
  _type: 'row'
  cells: string[]
}

export interface Table {
  _type: 'table'
  rows: Row[]
  label?: string
  hasHeader?: boolean
}

export type BlockItem = Line | Table

export interface Page {
  items: BlockItem[]
}

interface StashedPdfPage {
  pdfS3Key: string
}

export interface StashPdfResponse {
  pdfId: string
  pageCount: number
  s3Parent: string
  pages: StashedPdfPage[]
}

export interface OcrRequest {
  s3Key: string
}

export function validateOcrRequest(data: any): data is OcrRequest {
  return typeof data.s3Key === 'string'
}
