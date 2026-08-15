import json
from common.db import get_member_by_id

def parse_auth(event):
    """
    Parses request authorizer context.
    Returns (user_id, community_id, role)
    """
    request_context = event.get("requestContext", {})
    authorizer = request_context.get("authorizer", {})
    claims = authorizer.get("claims", {})
    
    # If no claims (e.g. local testing or missing authorizer), check headers
    if not claims:
        headers = event.get("headers", {}) or {}
        # Support case-insensitive headers
        headers_lower = {k.lower(): v for k, v in headers.items()}
        user_id = headers_lower.get("x-user-id")
        role = headers_lower.get("x-user-role")
        community_id = headers_lower.get("x-community-id")
        
        # If headers are missing, default to a fallback for testing
        if not user_id:
            user_id = "test-user-id"
        if not role:
            role = "Learner"
        if not community_id:
            community_id = "demo-community"
            
        return user_id, community_id, role

    user_id = claims.get("sub")
    
    # Extract groups (roles)
    groups = claims.get("cognito:groups", "")
    if isinstance(groups, str):
        groups = [g.strip() for g in groups.split(",") if g.strip()]
    
    # Determine the primary role
    if "Organizer" in groups:
        role = "Organizer"
    elif "Pro" in groups:
        role = "Pro"
    else:
        role = "Learner"
        
    # Get the communityId from member profile in DB
    member = get_member_by_id(user_id)
    if member:
        community_id = member.get("communityId")
    else:
        # Fallback for new user sign up (during setup page)
        # We can extract it from the path/query/body if not in DB yet
        community_id = "demo-community"
        
    return user_id, community_id, role

def require_role(event, allowed_roles):
    user_id, community_id, role = parse_auth(event)
    if role not in allowed_roles:
        raise PermissionError(f"Role {role} is not authorized. Allowed: {allowed_roles}")
    return user_id, community_id, role
