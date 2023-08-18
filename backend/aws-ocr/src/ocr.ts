import { parse } from 'lambda-multipart-parser'
import * as AWS_S3 from '@aws-sdk/client-s3'
import {
  Block,
  GetDocumentAnalysisCommandOutput,
  Relationship,
  Textract,
} from '@aws-sdk/client-textract'
import { mandatory, uuids } from '@cozemble/lang-util'

const { S3 } = AWS_S3

const textract = new Textract()
const s3 = new S3()

async function uploadToS3(bucketName: string, key: string, fileContent: Buffer | string) {
  const params: AWS_S3.PutObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  }

  return s3.putObject(params)
}

function joinWords(allBlocks: Block[], wordIds: Relationship[]): string {
  const ids = wordIds.flatMap((word) => word.Ids)
  return allBlocks
    .filter((block) => block.BlockType === 'WORD' && ids.includes(block.Id!))
    .map((word) => word.Text)
    .join(' ')
}

export function extractTables(allBlocks: Block[]) {
  const detectedTables = [] as any[]

  const tableBlocks = allBlocks.filter((block) => block.BlockType === 'TABLE')

  for (const tableBlock of tableBlocks) {
    const cellIds = tableBlock.Relationships?.find((rel) => rel.Type === 'CHILD')?.Ids || []
    const tableCells = allBlocks
      .filter((block) => block?.Id && cellIds.includes(block.Id))
      .map((cellBlock) => ({
        rowIndex: cellBlock.RowIndex!,
        columnIndex: cellBlock.ColumnIndex!,
        text: joinWords(allBlocks, cellBlock.Relationships ?? []),
      }))

    let maxRowIndex = 0
    const rowObjects = tableCells.reduce((acc, cell) => {
      const rowIndex = cell.rowIndex! - 1
      maxRowIndex = Math.max(maxRowIndex, rowIndex)
      const colIndex = cell.columnIndex! - 1
      if (!acc[rowIndex]) {
        acc[rowIndex] = []
      }
      acc[rowIndex][colIndex] = cell.text
      return acc
    }, {} as Record<number, string[]>)
    const rows = []
    // convert the rowObjects into an array of arrays
    for (let i = 0; i <= maxRowIndex; i++) {
      rows.push(rowObjects[i] ?? [])
    }

    detectedTables.push(rows)
  }
  return detectedTables
}

async function fetchAllBlocks(
  jobId: string,
  response: GetDocumentAnalysisCommandOutput,
  collector: Block[] = [],
): Promise<Block[]> {
  collector = [...collector, ...(response.Blocks ?? [])]
  if (response.NextToken) {
    const nextResponse = await textract.getDocumentAnalysis({
      JobId: jobId,
      NextToken: response.NextToken,
    })
    return fetchAllBlocks(jobId, nextResponse, collector)
  }
  return collector
}

async function waitForAnalysis(jobId: string): Promise<Block[]> {
  let pollCount = 0
  let finished = false
  let allBlocks: Block[] = []

  while (!finished && pollCount < 30) {
    const response: GetDocumentAnalysisCommandOutput = await textract.getDocumentAnalysis({
      JobId: jobId,
    })
    console.log(`Job status: ${response.JobStatus}`)
    if (response.JobStatus === 'FAILED') {
      throw new Error('Textract processing failed')
    }
    if (response.JobStatus === 'IN_PROGRESS') {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      pollCount++
    } else if (response.JobStatus === 'SUCCEEDED') {
      allBlocks = await fetchAllBlocks(jobId, response)
      finished = true
    }
  }

  return allBlocks
}

export async function ocr(event: any) {
  const result = await parse(event)

  const file = result.files[0]

  if (!file) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No file uploaded' }),
    }
  }
  const bucketName = mandatory(process.env.OCR_BUCKET_NAME, 'BUCKET_NAME')
  const s3Parent = `ocr/${uuids.v4()}`
  const s3Key = `${s3Parent}/${mandatory(file.filename, 'FILENAME')}`
  await uploadToS3(bucketName, s3Key, file.content)
  console.log(`File uploaded to S3: s3://${bucketName}/${s3Key}`)

  try {
    const startResponse = await textract.startDocumentAnalysis({
      DocumentLocation: {
        S3Object: {
          Bucket: bucketName,
          Name: s3Key,
        },
      },
      FeatureTypes: ['TABLES'],
    })
    const blocks = await waitForAnalysis(startResponse.JobId!)

    const detectedTables = extractTables(blocks)
    return {
      statusCode: 200,
      body: JSON.stringify({ tables: detectedTables }),
    }
  } catch (error: any) {
    console.error('Error doing OCR on the file:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error doing OCR on the file: ' + error.message }),
    }
  }
}
