import json
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            # Check if it has a fractional part
            if obj % 1 == 0:
                return int(obj)
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def make_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,x-user-id,x-user-role,x-community-id",
            "Access-Control-Allow-Methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT"
        },
        "body": json.dumps(body, cls=DecimalEncoder)
    }

def success(body):
    return make_response(200, body)

def error(status_code, message):
    return make_response(status_code, {"error": message})

def handle_exception(e):
    if isinstance(e, PermissionError):
        return error(403, str(e))
    elif isinstance(e, ValueError):
        return error(400, str(e))
    else:
        print(f"Unhandled system error: {e}")
        return error(500, "Internal Server Error")
