import * as AWS_S3 from '@aws-sdk/client-s3'

const { S3 } = AWS_S3
const s3 = new S3()

export async function uploadToS3(bucketName: string, key: string, fileContent: Buffer | string) {
  const params: AWS_S3.PutObjectCommandInput = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  }

  return s3.putObject(params)
}
