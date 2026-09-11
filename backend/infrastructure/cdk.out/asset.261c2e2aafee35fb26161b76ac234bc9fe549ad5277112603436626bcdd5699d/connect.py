import json
import os
import boto3
import uuid
import time
from common.auth import parse_auth, require_role
from common.response import success, error, handle_exception
from common.db import query_items, put_item, get_item, get_member_by_id, get_pro_by_id

# Boto3 clients
sns = boto3.client("sns")
bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")

CONNECTION_SNS_TOPIC_ARN = os.environ.get("CONNECTION_SNS_TOPIC_ARN")

def invoke_bedrock_llm(prompt):
    try:
        body = json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": 800,
                "temperature": 0.0,
                "topP": 0.9
            }
        })
        response = bedrock_runtime.invoke_model(
            modelId="amazon.titan-text-express-v1",
            contentType="application/json",
            accept="application/json",
            body=body
        )
        response_body = json.loads(response.get("body").read())
        return response_body.get("results")[0].get("outputText")
    except Exception as e:
        print(f"Titan failed in connect: {e}. Trying Claude...")
        try:
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 800,
                "temperature": 0.0,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
            response = bedrock_runtime.invoke_model(
                modelId="anthropic.claude-3-haiku-20240307-v1:0",
                contentType="application/json",
                accept="application/json",
                body=body
            )
            response_body = json.loads(response.get("body").read())
            return response_body.get("content")[0].get("text")
        except Exception as e2:
            print(f"Claude failed: {e2}")
            return None

def compute_llm_recommendations(goal, pros):
    """
    Ranks Pros using Bedrock Titan or Claude based on their experiences.
    """
    # Format candidates list
    candidates_data = []
    for p in pros:
        candidates_data.append({
            "memberId": p.get("id"),
            "name": p.get("name"),
            "title": p.get("title") or p.get("roleTitle") or "Pro",
            "skills": p.get("skills", []),
            "currentFocus": p.get("currentFocus") or p.get("focus") or "",
            "previousHelp": p.get("previousHelp", [])
        })
        
    prompt = (
        f"You are a professional matchmaking assistant for CommunityOS. "
        f"We have a learner with this goal: \"{goal}\"\n"
        f"Here are the eligible Pros in the community:\n"
        f"{json.dumps(candidates_data, indent=2)}\n\n"
        f"Compare the learner's goal with each Pro's details. Prioritize previousHelp entry matches that solved a similar problem. "
        f"Rank the candidates and output a JSON array of up to 3 matches. "
        f"For each match, return:\n"
        f"- memberId: Pro's memberId\n"
        f"- name: Pro's name\n"
        f"- title: Pro's title\n"
        f"- reason: A short, evidence-based reason referencing actual experiences from previousHelp (do NOT invent evidence). "
        f"For example: 'Elena solved a similar production RAG evaluation problem 2 months ago.'\n"
        f"- relevantExperience: The matching experience title or topic.\n"
        f"- timeframe: The timeframe when it occurred (e.g. '2 months ago').\n"
        f"Return ONLY a raw JSON array. Do not return any other text, reasoning, markdown or explanation."
    )
    
    output = invoke_bedrock_llm(prompt)
    if output:
        try:
            # Clean output block if contains markdown
            cleaned = output.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
            if cleaned.endswith("```"):
                cleaned = cleaned.rsplit("\n", 1)[0]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            return json.loads(cleaned)
        except Exception as parse_err:
            print(f"JSON Parse error on LLM output: {parse_err}. LLM output: {output}")
            
    # Fallback heuristic matching if LLM fails
    results = []
    goal_words = set(goal.lower().split())
    for p in pros:
        prev_helps = p.get("previousHelp", [])
        matched_help = None
        for h in prev_helps:
            topic = h.get("topic", "").lower()
            if any(w in topic for w in goal_words):
                matched_help = h
                break
        
        if matched_help:
            results.append({
                "memberId": p.get("id"),
                "name": p.get("name"),
                "title": p.get("title") or p.get("roleTitle") or "Pro",
                "reason": f"{p.get('name')} solved a similar {matched_help.get('topic')} problem {matched_help.get('timeframe', 'previously')}.",
                "relevantExperience": matched_help.get("topic"),
                "timeframe": matched_help.get("timeframe", "2 months ago")
            })
            
    # If still empty, return first available pros
    if not results and pros:
        for p in pros[:2]:
            results.append({
                "memberId": p.get("id"),
                "name": p.get("name"),
                "title": p.get("title") or p.get("roleTitle") or "Pro",
                "reason": f"{p.get('name')} is an expert in related fields with skills: {', '.join(p.get('skills', []))}.",
                "relevantExperience": "General expertise",
                "timeframe": "ongoing"
            })
            
    return results

def handler(event, context):
    try:
        user_id, community_id, role = parse_auth(event)
        http_method = event.get("httpMethod")
        resource = event.get("resource")
        path_parameters = event.get("pathParameters") or {}
        
        # Route: POST /connect/recommendations
        if resource == "/connect/recommendations" and http_method == "POST":
            require_role(event, ["Learner", "Pro", "Organizer"])
            body = json.loads(event.get("body", "{}"))
            goal = body.get("goal")
            if not goal:
                return error(400, "Missing goal parameter")
                
            # Retrieve all pros in this community
            all_pros = query_items(f"COMMUNITY#{community_id}", "PRO#")
            
            # Filter open to matching
            eligible_pros = []
            for p in all_pros:
                # Support both openToMatching and openToMatch
                open_matching = p.get("openToMatching")
                if open_matching is None:
                    open_matching = p.get("openToMatch", True)
                if open_matching:
                    eligible_pros.append(p)
                    
            recs = compute_llm_recommendations(goal, eligible_pros)
            return success(recs)
            
        # Route: POST /connections
        elif resource == "/connections" and http_method == "POST":
            require_role(event, ["Learner"])
            body = json.loads(event.get("body", "{}"))
            pro_id = body.get("proId")
            
            if not pro_id:
                return error(400, "Missing proId parameter")
                
            # Validate pro exists and belongs to same community
            pro_profile = get_pro_by_id(pro_id)
            if not pro_profile:
                # Fallback to check member record
                pro_profile = get_member_by_id(pro_id)
                
            if not pro_profile or pro_profile.get("communityId") != community_id:
                return error(404, "Target Pro not found in this community")
                
            open_matching = pro_profile.get("openToMatching")
            if open_matching is None:
                open_matching = pro_profile.get("openToMatch", True)
            if not open_matching:
                return error(400, "Pro is not open to matching")
                
            connection_id = str(uuid.uuid4())
            connection_record = {
                "PK": f"COMMUNITY#{community_id}",
                "SK": f"CONNECTION#{connection_id}",
                "GSI1PK": f"PRO#{pro_id}",
                "GSI1SK": f"CONNECTION#{connection_id}",
                "id": connection_id,
                "connectionId": connection_id,
                "learnerId": user_id,
                "proId": pro_id,
                "status": "pending",
                "createdAt": int(time.time()),
                "communityId": community_id
            }
            
            put_item(connection_record)
            
            # Publish CONNECTION_REQUESTED to SNS
            if CONNECTION_SNS_TOPIC_ARN:
                sns.publish(
                    TopicArn=CONNECTION_SNS_TOPIC_ARN,
                    Message=json.dumps({
                        "connectionId": connection_id,
                        "eventType": "CONNECTION_REQUESTED",
                        "learnerId": user_id,
                        "proId": pro_id,
                        "communityId": community_id,
                        "timestamp": int(time.time())
                    })
                )
                
            return success(connection_record)
            
        # Route: GET /connections
        elif resource == "/connections" and http_method == "GET":
            # Fetch connections for current user (either learner or pro)
            all_connections = query_items(f"COMMUNITY#{community_id}", "CONNECTION#")
            user_connections = []
            for c in all_connections:
                if c.get("learnerId") == user_id or c.get("proId") == user_id:
                    user_connections.append(c)
            return success(user_connections)
            
        # Route: PUT /connections/{connectionId}
        elif resource == "/connections/{connectionId}" and http_method == "PUT":
            connection_id = path_parameters.get("connectionId")
            body = json.loads(event.get("body", "{}"))
            status = body.get("status") # "accepted" or "declined"
            
            if status not in ["accepted", "declined"]:
                return error(400, "Invalid status")
                
            connection = get_item(f"COMMUNITY#{community_id}", f"CONNECTION#{connection_id}")
            if not connection:
                return error(404, "Connection not found")
                
            if connection.get("proId") != user_id:
                return error(403, "Only the target Pro can update connection status")
                
            connection["status"] = status
            put_item(connection)
            
            # Publish to SNS
            event_type = "CONNECTION_ACCEPTED" if status == "accepted" else "CONNECTION_DECLINED"
            if CONNECTION_SNS_TOPIC_ARN:
                sns.publish(
                    TopicArn=CONNECTION_SNS_TOPIC_ARN,
                    Message=json.dumps({
                        "connectionId": connection_id,
                        "eventType": event_type,
                        "learnerId": connection.get("learnerId"),
                        "proId": user_id,
                        "communityId": community_id,
                        "timestamp": int(time.time())
                    })
                )
                
            return success(connection)
            
        # Route: GET /pros/{memberId}/requests
        elif resource == "/pros/{memberId}/requests" and http_method == "GET":
            req_member_id = path_parameters.get("memberId")
            if req_member_id != user_id:
                return error(403, "Access denied")
                
            # Query connections where target is this Pro
            response = boto3.resource("dynamodb").Table(os.environ.get("TABLE_NAME")).query(
                IndexName="GSI1",
                KeyConditionExpression=boto3.dynamodb.conditions.Key("GSI1PK").eq(f"PRO#{user_id}") & 
                                         boto3.dynamodb.conditions.Key("GSI1SK").begins_with("CONNECTION#")
            )
            return success(response.get("Items", []))
            
        # Route: PUT /pros/requests/{requestId}
        elif resource == "/pros/requests/{requestId}" and http_method == "PUT":
            # Direct mapping from frontend mock names
            request_id = path_parameters.get("requestId")
            body = json.loads(event.get("body", "{}"))
            status = body.get("status") # "accepted" or "declined"
            
            connection = get_item(f"COMMUNITY#{community_id}", f"CONNECTION#{request_id}")
            if not connection:
                return error(404, "Request not found")
                
            if connection.get("proId") != user_id:
                return error(403, "Unauthorized")
                
            connection["status"] = status
            put_item(connection)
            
            # Publish to SNS
            event_type = "CONNECTION_ACCEPTED" if status == "accepted" else "CONNECTION_DECLINED"
            if CONNECTION_SNS_TOPIC_ARN:
                sns.publish(
                    TopicArn=CONNECTION_SNS_TOPIC_ARN,
                    Message=json.dumps({
                        "connectionId": request_id,
                        "eventType": event_type,
                        "learnerId": connection.get("learnerId"),
                        "proId": user_id,
                        "communityId": community_id,
                        "timestamp": int(time.time())
                    })
                )
            return success(connection)
            
        return error(400, "Invalid route")
    except Exception as e:
        return handle_exception(e)
