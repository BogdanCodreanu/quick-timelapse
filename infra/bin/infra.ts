#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { StorageStack } from '../lib/storage-stack';

const app = new cdk.App();

// Account/region come from the AWS profile used at deploy time
// (e.g. `cdk deploy --profile bogdan` resolves CDK_DEFAULT_* to eu-central-1).
new StorageStack(app, 'QuickTimelapseStorage', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
