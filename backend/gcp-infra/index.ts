import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'

const bucketName = 'cozemble-objects-1'
const bucket = new gcp.storage.Bucket(bucketName, {
  name: bucketName,
  location: 'EU',
  versioning: {
    enabled: false,
  },
})

export const bucketUrl = pulumi.interpolate`gs://${bucket.name}`
