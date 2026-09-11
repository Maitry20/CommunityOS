import json
from common.auth import parse_auth, require_role
from common.response import success, error, handle_exception
from common.db import get_item, put_item, get_member_by_id

def handler(event, context):
    try:
        http_method = event.get("httpMethod")
        resource = event.get("resource")
        path_parameters = event.get("pathParameters") or {}
        
        user_id, community_id, role = parse_auth(event)
        
        # Route: GET /me
        if resource == "/me" and http_method == "GET":
            member = get_member_by_id(user_id)
            if not member:
                # If member profile doesn't exist, return a dummy shell for new users
                return success({
                    "id": user_id,
                    "communityId": community_id,
                    "role": role,
                    "name": "",
                    "email": "",
                    "roleTitle": "",
                    "skills": [],
                    "focus": "",
                    "openToMatching": True,
                    "picUrl": None,
                    "isNew": True
                })
            return success(member)
            
        # Route: GET /members/{memberId}
        elif resource == "/members/{memberId}" and http_method == "GET":
            req_member_id = path_parameters.get("memberId")
            member = get_member_by_id(req_member_id)
            if not member:
                return error(404, "Member not found")
            # Enforce community scope check
            if member.get("communityId") != community_id:
                return error(403, "Access denied: different community scope")
            return success(member)
            
        # Route: PUT /members/{memberId}
        elif resource == "/members/{memberId}" and http_method == "PUT":
            req_member_id = path_parameters.get("memberId")
            if req_member_id != user_id and role != "Organizer":
                return error(403, "Access denied: cannot modify other profiles")
                
            body = json.loads(event.get("body", "{}"))
            
            # Retrieve existing profile
            existing = get_member_by_id(req_member_id) or {}
            
            # Construct updated profile
            updated_profile = {
                "PK": f"COMMUNITY#{community_id}",
                "SK": f"MEMBER#{req_member_id}",
                "GSI1PK": f"MEMBER#{req_member_id}",
                "GSI1SK": "METADATA",
                "id": req_member_id,
                "communityId": community_id,
                "name": body.get("name", existing.get("name", "")),
                "email": body.get("email", existing.get("email", "")),
                "roleTitle": body.get("roleTitle", existing.get("roleTitle", "")),
                "skills": body.get("skills", existing.get("skills", [])),
                "focus": body.get("focus", existing.get("focus", "")),
                "openToMatching": body.get("openToMatching", existing.get("openToMatching", True)),
                "picUrl": body.get("picUrl", existing.get("picUrl")),
                "roles": body.get("roles", existing.get("roles", ["Learner"])),
                "bio": body.get("bio", existing.get("bio", ""))
            }
            
            put_item(updated_profile)
            return success(updated_profile)
            
        # Route: PUT /pros/{memberId}
        elif resource == "/pros/{memberId}" and http_method == "PUT":
            req_member_id = path_parameters.get("memberId")
            if req_member_id != user_id:
                return error(403, "Access denied: cannot modify other profiles")
                
            body = json.loads(event.get("body", "{}"))
            existing_pro = get_item(f"COMMUNITY#{community_id}", f"PRO#{req_member_id}") or {}
            
            # Construct updated pro profile
            updated_pro = {
                "PK": f"COMMUNITY#{community_id}",
                "SK": f"PRO#{req_member_id}",
                "GSI1PK": f"PRO#{req_member_id}",
                "GSI1SK": "METADATA",
                "id": req_member_id,
                "communityId": community_id,
                "name": body.get("name", existing_pro.get("name", "")),
                "title": body.get("title", existing_pro.get("title", "")),
                "skills": body.get("skills", existing_pro.get("skills", [])),
                "interests": body.get("interests", existing_pro.get("interests", [])),
                "currentFocus": body.get("currentFocus", existing_pro.get("currentFocus", "")),
                "openToMatching": body.get("openToMatching", existing_pro.get("openToMatching", True)),
                "previousHelp": body.get("previousHelp", existing_pro.get("previousHelp", [])),
                "communityActivity": body.get("communityActivity", existing_pro.get("communityActivity", {})),
                "sessionsAttended": body.get("sessionsAttended", existing_pro.get("sessionsAttended", 0)),
                "questionsAnswered": body.get("questionsAnswered", existing_pro.get("questionsAnswered", 0)),
                "talksGiven": body.get("talksGiven", existing_pro.get("talksGiven", 0))
            }
            
            put_item(updated_pro)
            return success(updated_pro)
            
        return error(400, "Unknown route or method")
        
    except Exception as e:
        return handle_exception(e)
