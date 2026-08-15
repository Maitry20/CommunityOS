import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class CommunityOsInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. DynamoDB Table
    const table = new dynamodb.Table(this, 'CommunityOSTable', {
      tableName: 'CommunityOSTable',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For hackathon cleanup
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // 2. S3 Bucket
    const bucket = new s3.Bucket(this, 'CommunityOSKnowledgeBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 3. Cognito User Pool
    const userPool = new cognito.UserPool(this, 'CommunityOSUserPool', {
      userPoolName: 'community-os-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true, username: false },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'CommunityOSUserPoolClient', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userPassword: true,
        userSrp: true,
      },
    });

    // Cognito Groups
    const learnerGroup = new cognito.CfnUserPoolGroup(this, 'LearnerGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Learner',
      description: 'Learner role group',
    });

    const proGroup = new cognito.CfnUserPoolGroup(this, 'ProGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Pro',
      description: 'Pro role group',
    });

    const organizerGroup = new cognito.CfnUserPoolGroup(this, 'OrganizerGroup', {
      userPoolId: userPool.userPoolId,
      groupName: 'Organizer',
      description: 'Organizer role group',
    });

    // 4. SNS Topics
    const connectionTopic = new sns.Topic(this, 'CommunityConnectionsTopic', {
      topicName: 'community-connections',
    });

    const alertTopic = new sns.Topic(this, 'CommunityAlertsTopic', {
      topicName: 'community-alerts',
    });

    // 5. Shared Lambda Properties
    const lambdaEnv = {
      TABLE_NAME: table.tableName,
      BUCKET_NAME: bucket.bucketName,
      CONNECTION_SNS_TOPIC_ARN: connectionTopic.topicArn,
      ALERT_SNS_TOPIC_ARN: alertTopic.topicArn,
      BEDROCK_KNOWLEDGE_BASE_ID: process.env.BEDROCK_KNOWLEDGE_BASE_ID || 'dummy-kb-id',
    };

    const pythonRuntime = lambda.Runtime.PYTHON_3_12;

    const authProfileLambda = new lambda.Function(this, 'AuthProfileHandler', {
      runtime: pythonRuntime,
      handler: 'auth_profile.handler',
      code: lambda.Code.fromAsset('../src'),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
    });

    const memoryLambda = new lambda.Function(this, 'MemoryHandler', {
      runtime: pythonRuntime,
      handler: 'memory.handler',
      code: lambda.Code.fromAsset('../src'),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
    });

    const connectLambda = new lambda.Function(this, 'ConnectHandler', {
      runtime: pythonRuntime,
      handler: 'connect.handler',
      code: lambda.Code.fromAsset('../src'),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
    });

    const radarLambda = new lambda.Function(this, 'RadarHandler', {
      runtime: pythonRuntime,
      handler: 'radar.handler',
      code: lambda.Code.fromAsset('../src'),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
    });

    const eventLambda = new lambda.Function(this, 'EventHandler', {
      runtime: pythonRuntime,
      handler: 'events.handler',
      code: lambda.Code.fromAsset('../src'),
      environment: lambdaEnv,
      timeout: cdk.Duration.seconds(30),
    });

    // 6. Grant Permissions
    // DynamoDB Permissions
    table.grantReadWriteData(authProfileLambda);
    table.grantReadWriteData(memoryLambda);
    table.grantReadWriteData(connectLambda);
    table.grantReadWriteData(radarLambda);
    table.grantReadWriteData(eventLambda);

    // S3 Permissions
    bucket.grantReadWrite(eventLambda);
    bucket.grantRead(memoryLambda);

    // SNS Permissions
    connectionTopic.grantPublish(connectLambda);
    alertTopic.grantPublish(radarLambda);
    alertTopic.grantPublish(eventLambda);

    // Bedrock Permissions for LLM & Knowledge Bases
    const bedrockPolicy = new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:Retrieve',
        'bedrock:RetrieveAndGenerate',
      ],
      resources: ['*'], // Bedrock doesn't strictly lock to specific ARNs for generic model invocation
    });
    memoryLambda.addToRolePolicy(bedrockPolicy);
    connectLambda.addToRolePolicy(bedrockPolicy);
    radarLambda.addToRolePolicy(bedrockPolicy);

    // 7. API Gateway Setup
    const api = new apigateway.RestApi(this, 'CommunityOSApi', {
      restApiName: 'CommunityOS API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'x-user-id', 'x-user-role', 'x-community-id'],
      },
    });

    // const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
    //   cognitoUserPools: [userPool],
    // });

    const authOptions = {};

    // Endpoints Routing
    // GET /me
    api.root.addResource('me').addMethod('GET', new apigateway.LambdaIntegration(authProfileLambda), authOptions);

    // /members
    const membersResource = api.root.addResource('members');
    const singleMemberResource = membersResource.addResource('{memberId}');
    singleMemberResource.addMethod('GET', new apigateway.LambdaIntegration(authProfileLambda), authOptions);
    singleMemberResource.addMethod('PUT', new apigateway.LambdaIntegration(authProfileLambda), authOptions);

    // /memory
    const memoryResource = api.root.addResource('memory');
    memoryResource.addResource('query').addMethod('POST', new apigateway.LambdaIntegration(memoryLambda), authOptions);

    // /connect
    const connectResource = api.root.addResource('connect');
    connectResource.addResource('recommendations').addMethod('POST', new apigateway.LambdaIntegration(connectLambda), authOptions);

    // /connections
    const connectionsResource = api.root.addResource('connections');
    connectionsResource.addMethod('POST', new apigateway.LambdaIntegration(connectLambda), authOptions);
    connectionsResource.addMethod('GET', new apigateway.LambdaIntegration(connectLambda), authOptions);
    connectionsResource.addResource('{connectionId}').addMethod('PUT', new apigateway.LambdaIntegration(connectLambda), authOptions);

    // /pros
    const prosResource = api.root.addResource('pros');
    const singleProResource = prosResource.addResource('{memberId}');
    singleProResource.addMethod('PUT', new apigateway.LambdaIntegration(authProfileLambda), authOptions);
    singleProResource.addResource('requests').addMethod('GET', new apigateway.LambdaIntegration(connectLambda), authOptions);

    const proRequestsResource = prosResource.addResource('requests');
    proRequestsResource.addResource('{requestId}').addMethod('PUT', new apigateway.LambdaIntegration(connectLambda), authOptions);

    // /radar
    const radarResource = api.root.addResource('radar');
    radarResource.addMethod('GET', new apigateway.LambdaIntegration(radarLambda), authOptions);
    
    const gapsResource = radarResource.addResource('gaps');
    gapsResource.addMethod('GET', new apigateway.LambdaIntegration(radarLambda), authOptions);
    
    radarResource.addResource('topics').addMethod('GET', new apigateway.LambdaIntegration(radarLambda), authOptions);
    radarResource.addResource('events').addMethod('GET', new apigateway.LambdaIntegration(radarLambda), authOptions);
    
    const singleGapResource = gapsResource.addResource('{gapId}');
    singleGapResource.addMethod('GET', new apigateway.LambdaIntegration(radarLambda), authOptions);
    singleGapResource.addResource('actions').addMethod('POST', new apigateway.LambdaIntegration(radarLambda), authOptions);

    // /events
    const eventsResource = api.root.addResource('events');
    eventsResource.addMethod('POST', new apigateway.LambdaIntegration(eventLambda), authOptions);
    
    const singleEventResource = eventsResource.addResource('{eventId}');
    singleEventResource.addResource('photos').addMethod('POST', new apigateway.LambdaIntegration(eventLambda), authOptions);

    // /notifications/test
    api.root.addResource('notifications').addResource('test').addMethod('POST', new apigateway.LambdaIntegration(eventLambda), authOptions);

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
  }
}
