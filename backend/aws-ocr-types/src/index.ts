export interface BoundingBox {
  _type: 'boundingBox'
  left: number
  top: number
  width: number
  height: number
}

export function boundingBox(left: number, top: number, width: number, height: number): BoundingBox {
  return { _type: 'boundingBox', left, top, width, height }
}

export interface Line {
  _type: 'line'
  text: string
  boundingBox: BoundingBox
}

export function line(text: string, boundingBox: BoundingBox): Line {
  return { _type: 'line', text, boundingBox }
}

export interface Row {
  _type: 'row'
  cells: string[]
}

export function row(cells: string[]): Row {
  return { _type: 'row', cells }
}

export interface Table {
  _type: 'table'
  rows: Row[]
  label?: string
  hasHeader?: boolean
  boundingBox?: BoundingBox
}

export function table(
  rows: Row[],
  boundingBox: BoundingBox,
  label?: string,
  hasHeader?: boolean,
): Table {
  return { _type: 'table', rows, boundingBox, label, hasHeader }
}

export interface LabeledSection {
  _type: 'labeledSection'
  label: string
  items: BlockItem[]
}

export type BlockItem = Line | Table

export interface Page {
  sections: LabeledSection[]
  items: BlockItem[]
}

export interface StashedPdfPage {
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
