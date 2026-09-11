#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CommunityOsInfraStack } from '../lib/infra-stack';

const app = new cdk.App();
new CommunityOsInfraStack(app, 'CommunityOsInfraStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1' 
  },
});
