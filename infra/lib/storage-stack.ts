import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';

export class StorageStack extends cdk.Stack {
  /** S3 bucket that holds images uploaded by the web app. */
  public readonly imagesBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.imagesBucket = new s3.Bucket(this, 'ImagesBucket', {
      // Private bucket: all public access blocked. The web app reads and
      // writes objects via presigned URLs, so no public ACLs or policies
      // are needed.
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      // CORS so the browser can upload (PUT) and read (GET) objects directly
      // through presigned URLs. The wildcard port covers whatever port the Next
      // dev server lands on (3000/3001/3002…). Add your deployed origin here
      // once the web app is hosted.
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['http://localhost:*', 'http://127.0.0.1:*'],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: 3000,
        },
      ],
      // Keep uploaded images even if the stack is torn down.
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, 'ImagesBucketName', {
      value: this.imagesBucket.bucketName,
      description: 'Name of the S3 bucket that stores uploaded images',
    });

    new cdk.CfnOutput(this, 'ImagesBucketRegion', {
      value: this.region,
      description: 'Region of the images bucket',
    });
  }
}
