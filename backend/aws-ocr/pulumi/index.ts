import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

const apiKeyValue = new pulumi.Config().requireSecret('ocrApiKey')

const ocrBucket = new aws.s3.Bucket('ocrBucket')

const lambdaRole = new aws.iam.Role('lambdaRole', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Principal: {
          Service: 'lambda.amazonaws.com',
        },
        Effect: 'Allow',
        Sid: '',
      },
    ],
  }),
})

new aws.iam.RolePolicyAttachment('lambdaFullAccess', {
  role: lambdaRole.name,
  policyArn: 'arn:aws:iam::aws:policy/AWSLambda_FullAccess',
})

const lambdaRolePolicy = new aws.iam.RolePolicy('lambdaFullAccess', {
  role: lambdaRole.id,
  policy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
        Resource: 'arn:aws:logs:*:*:*',
        Effect: 'Allow',
      },
    ],
  }),
})

const lambda = new aws.lambda.Function('mylambda', {
  role: lambdaRole.arn,
  runtime: 'nodejs18.x',
  handler: 'handler.handler',
  code: new pulumi.asset.AssetArchive({
    '.': new pulumi.asset.FileArchive('./dist'),
  }),
  timeout: 60,
  environment: {
    variables: {
      OCR_BUCKET_NAME: ocrBucket.bucket, // Assuming s3Bucket is the Pulumi resource for your S3 bucket
      OCR_API_KEY: apiKeyValue,
    },
  },
})

// Give the Lambda permission to be invoked by the API Gateway
const lambdaPermission = new aws.lambda.Permission('apiGatewayPermission', {
  action: 'lambda:InvokeFunction',
  function: lambda,
  principal: 'apigateway.amazonaws.com',
})

// Define the API Gateway
const api = new aws.apigatewayv2.Api('myApi', {
  protocolType: 'HTTP',
})

// Create a route in the API Gateway that points to your Lambda
const lambdaIntegration = new aws.apigatewayv2.Integration('lambdaIntegration', {
  apiId: api.id,
  integrationType: 'AWS_PROXY',
  integrationUri: lambda.arn,
  payloadFormatVersion: '2.0',
})

const route = new aws.apigatewayv2.Route('route', {
  apiId: api.id,
  routeKey: 'ANY /{proxy+}',
  target: pulumi.interpolate`integrations/${lambdaIntegration.id}`,
})

// Deploy the API
const deployment = new aws.apigatewayv2.Deployment(
  'deployment',
  {
    apiId: api.id,
  },
  { dependsOn: [route] },
)

const stageName = 'prod' // Change this to your desired stage name

const stage = new aws.apigatewayv2.Stage('stage', {
  apiId: api.id,
  deploymentId: deployment.id,
  autoDeploy: true,
  name: stageName, // Set the stage name explicitly here
})

const lambdaS3BucketPolicy = ocrBucket.arn.apply((arn) => ({
  Version: '2012-10-17',
  Statement: [
    {
      Effect: 'Allow',
      Action: 's3:*',
      Resource: [`${arn}`, `${arn}/*`],
    },
  ],
}))

const lambdaS3BucketRolePolicy = new aws.iam.RolePolicy('lambdaS3BucketRolePolicy', {
  role: lambdaRole.id,
  policy: lambdaS3BucketPolicy.apply((policy) => JSON.stringify(policy)),
})

// Create a Textract policy
const textractPolicy = JSON.stringify({
  Version: '2012-10-17',
  Statement: [
    {
      Action: [
        'textract:StartDocumentTextDetection',
        'textract:GetDocumentTextDetection',
        'textract:StartDocumentAnalysis',
        'textract:GetDocumentAnalysis',
        'textract:AnalyzeDocument',
      ],
      Resource: '*',
      Effect: 'Allow',
    },
  ],
})

// Attach Textract policy to the Lambda role
const lambdaTextractRolePolicy = new aws.iam.RolePolicy('lambdaTextractRolePolicy', {
  role: lambdaRole.id,
  policy: textractPolicy,
})

// S3 Bucket Policy that allows Textract to access objects
const ocrBucketPolicy = new aws.s3.BucketPolicy('ocrBucketPolicy', {
  bucket: ocrBucket.bucket,
  policy: ocrBucket.arn.apply((arn) =>
    JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowTextractAccess',
          Effect: 'Allow',
          Principal: {
            Service: 'textract.amazonaws.com',
          },
          Action: ['s3:*'],
          Resource: [`${arn}`, `${arn}/*`],
        },
      ],
    }),
  ),
})

// Textract Service Role
const textractServiceRole = new aws.iam.Role('textractServiceRole', {
  assumeRolePolicy: JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Action: 'sts:AssumeRole',
        Principal: {
          Service: 'textract.amazonaws.com',
        },
        Effect: 'Allow',
        Sid: '',
      },
    ],
  }),
})

// Policy granting Textract access to S3 bucket
const textractS3BucketPolicy = ocrBucket.arn.apply((arn) =>
  JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Action: ['s3:*'],
        Resource: [`${arn}`, `${arn}/*`],
      },
    ],
  }),
)

// Attach the policy to the Textract Service Role
const textractS3BucketRolePolicy = new aws.iam.RolePolicy('textractS3BucketRolePolicy', {
  role: textractServiceRole.id,
  policy: textractS3BucketPolicy,
})

// Export the HTTP endpoint of the API Gateway
export const apiUrl = pulumi.interpolate`https://${api.id}.execute-api.${aws.config.region}.amazonaws.com/${stageName}/`
