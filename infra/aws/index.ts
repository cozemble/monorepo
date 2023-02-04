import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'
import * as awsx from '@pulumi/awsx'
import * as random from '@pulumi/random'

const vpc = new awsx.ec2.Vpc('vpc')

const dbsubnet = new aws.rds.SubnetGroup('dbsubnet', {
  subnetIds: vpc.privateSubnetIds,
})
const dbpassword = new random.RandomString('password', {
  length: 20,
}).result

const dbPasswordSecret = pulumi.secret(dbpassword)

const db = new aws.rds.Cluster('db', {
  engine: 'aurora-postgresql',
  engineMode: 'serverless',
  engineVersion: '11.8',
  dbSubnetGroupName: dbsubnet.name,
  masterUsername: 'cozemble',
  masterPassword: dbPasswordSecret,
  scalingConfiguration: {
    autoPause: true,
    maxCapacity: 4,
    minCapacity: 2,
    secondsUntilAutoPause: 300,
    timeoutAction: 'RollbackCapacityChange',
  },
})
