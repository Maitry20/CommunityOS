import os
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

# Table name from environment variables
TABLE_NAME = os.environ.get("TABLE_NAME", "CommunityOSTable")
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME)

def get_item(pk, sk):
    try:
        response = table.get_item(Key={"PK": pk, "SK": sk})
        return response.get("Item")
    except ClientError as e:
        print(f"DynamoDB get_item error: {e}")
        raise e

def put_item(item):
    try:
        table.put_item(Item=item)
        return item
    except ClientError as e:
        print(f"DynamoDB put_item error: {e}")
        raise e

def delete_item(pk, sk):
    try:
        table.delete_item(Key={"PK": pk, "SK": sk})
        return True
    except ClientError as e:
        print(f"DynamoDB delete_item error: {e}")
        raise e

def query_items(pk, sk_prefix=None, filter_expression=None):
    try:
        if sk_prefix:
            key_expression = Key("PK").eq(pk) & Key("SK").begins_with(sk_prefix)
        else:
            key_expression = Key("PK").eq(pk)
            
        kwargs = {"KeyConditionExpression": key_expression}
        if filter_expression:
            kwargs["FilterExpression"] = filter_expression
            
        response = table.query(**kwargs)
        return response.get("Items", [])
    except ClientError as e:
        print(f"DynamoDB query_items error: {e}")
        raise e

def get_member_by_id(member_id):
    """
    Finds a member across communities using GSI1.
    GSI1 PK is MEMBER#{member_id}
    """
    try:
        response = table.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1PK").eq(f"MEMBER#{member_id}") & Key("GSI1SK").eq("METADATA")
        )
        items = response.get("Items", [])
        return items[0] if items else None
    except ClientError as e:
        print(f"Error fetching member by GSI: {e}")
        return None

def get_pro_by_id(member_id):
    """
    Finds a pro across communities using GSI1.
    GSI1 PK is PRO#{member_id}
    """
    try:
        response = table.query(
            IndexName="GSI1",
            KeyConditionExpression=Key("GSI1PK").eq(f"PRO#{member_id}") & Key("GSI1SK").eq("METADATA")
        )
        items = response.get("Items", [])
        return items[0] if items else None
    except ClientError as e:
        print(f"Error fetching pro by GSI: {e}")
        return None
