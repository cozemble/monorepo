import { parse } from 'lambda-multipart-parser'
import * as AWS_S3 from '@aws-sdk/client-s3'
import { Block, GetDocumentAnalysisCommandOutput, Textract } from '@aws-sdk/client-textract'
import { mandatory, uuids } from '@cozemble/lang-util'
import { textractToJson } from './textractToJson'
import { jsonToHtml } from './jsonToHtml'
import { uploadToS3 } from './uploadToS3'

const { S3 } = AWS_S3

const textract = new Textract()
const s3 = new S3()
const bucketName = mandatory(process.env.OCR_BUCKET_NAME, 'BUCKET_NAME')

export async function fetchAllBlocks(
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

async function waitForAnalysis(s3Key: string, jobId: string): Promise<Block[]> {
  let pollCount = 0
  let finished = false
  let allBlocks: Block[] = []

  while (!finished && pollCount < 60) {
    const response: GetDocumentAnalysisCommandOutput = await textract.getDocumentAnalysis({
      JobId: jobId,
    })
    if (response.JobStatus === 'FAILED') {
      throw new Error('Textract processing failed')
    }
    if (response.JobStatus === 'IN_PROGRESS') {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      pollCount++
    } else if (response.JobStatus === 'SUCCEEDED') {
      await uploadToS3(bucketName, s3Key + '/textract.json', JSON.stringify(response, null, 2))
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
    const blocks = await waitForAnalysis(s3Parent, startResponse.JobId!)
    const blocksS3Key = `${s3Parent}/blocks.json`
    await uploadToS3(bucketName, blocksS3Key, JSON.stringify(blocks, null, 2))
    console.log(`Blocks uploaded to S3: s3://${bucketName}/${blocksS3Key}`)
    const json = textractToJson(blocks)
    const html = jsonToHtml(json)

    return {
      statusCode: 200,
      body: JSON.stringify({ json, html }),
    }
  } catch (error: any) {
    console.error('Error doing OCR on the file:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error doing OCR on the file: ' + error.message }),
    }
  }
}
