import json
import os
import boto3
import time
import uuid
from common.auth import parse_auth, require_role
from common.response import success, error, handle_exception
from common.db import query_items, put_item, get_item

# Boto3 clients
sns = boto3.client("sns")
s3 = boto3.client("s3")

ALERT_SNS_TOPIC_ARN = os.environ.get("ALERT_SNS_TOPIC_ARN")
BUCKET_NAME = os.environ.get("BUCKET_NAME")

def handler(event, context):
    try:
        user_id, community_id, role = parse_auth(event)
        http_method = event.get("httpMethod")
        resource = event.get("resource")
        path_parameters = event.get("pathParameters") or {}
        
        # Route: POST /events
        if resource == "/events" and http_method == "POST":
            require_role(event, ["Organizer"])
            body = json.loads(event.get("body", "{}"))
            
            event_id = str(uuid.uuid4())
            topic = body.get("topic")
            name = body.get("name")
            gap_id = body.get("gapId")
            suggested_speakers = body.get("suggestedSpeakers", [])
            
            if not name or not topic:
                return error(400, "Missing name or topic parameter")
                
            event_record = {
                "PK": f"COMMUNITY#{community_id}",
                "SK": f"EVENT#{event_id}",
                "GSI1PK": f"EVENT#{event_id}",
                "GSI1SK": "METADATA",
                "id": event_id,
                "eventId": event_id,
                "communityId": community_id,
                "name": name,
                "topic": topic,
                "gapId": gap_id,
                "suggestedSpeakers": suggested_speakers,
                "attendance": body.get("attendance", 0),
                "questionsCount": body.get("questionsCount", 0),
                "topTopic": body.get("topTopic", topic),
                "photoUrl": None,
                "createdAt": int(time.time()),
                "status": "scheduled"
            }
            
            put_item(event_record)
            
            # Publish EVENT_CREATED to SNS
            if ALERT_SNS_TOPIC_ARN:
                sns.publish(
                    TopicArn=ALERT_SNS_TOPIC_ARN,
                    Message=json.dumps({
                        "communityId": community_id,
                        "eventType": "EVENT_CREATED",
                        "eventId": event_id,
                        "topic": topic,
                        "timestamp": int(time.time()),
                        "suggestedSpeakers": suggested_speakers
                    })
                )
                
            return success(event_record)
            
        # Route: POST /events/{eventId}/photos
        elif resource == "/events/{eventId}/photos" and http_method == "POST":
            require_role(event, ["Organizer"])
            event_id = path_parameters.get("eventId")
            
            # Get event to verify it exists and belongs to this community
            event_rec = get_item(f"COMMUNITY#{community_id}", f"EVENT#{event_id}")
            if not event_rec:
                return error(404, "Event not found")
                
            body = json.loads(event.get("body", "{}"))
            filename = body.get("filename", "photo.jpg")
            content_type = body.get("contentType", "image/jpeg")
            
            # Generate pre-signed URL for frontend to upload photo to S3
            s3_key = f"community/{community_id}/photos/{event_id}/{uuid.uuid4()}-{filename}"
            
            try:
                presigned_url = s3.generate_presigned_url(
                    "put_object",
                    Params={
                        "Bucket": BUCKET_NAME,
                        "Key": s3_key,
                        "ContentType": content_type
                    },
                    ExpiresIn=3600
                )
            except Exception as e:
                print(f"Error generating presigned URL: {e}")
                return error(500, "Could not generate upload URL")
                
            # Update event record with photo key
            photo_url = f"s3://{BUCKET_NAME}/{s3_key}"
            event_rec["photoUrl"] = photo_url
            put_item(event_rec)
            
            return success({
                "uploadUrl": presigned_url,
                "photoUrl": photo_url
            })
            
        # Route: POST /events/{eventId}/outcome (Complete event & measure gap reduction)
        elif resource.endswith("/outcome") and http_method == "POST":
            require_role(event, ["Organizer"])
            event_id = path_parameters.get("eventId")
            event_rec = get_item(f"COMMUNITY#{community_id}", f"EVENT#{event_id}")
            if not event_rec:
                return error(404, "Event not found")
                
            body = json.loads(event.get("body", "{}"))
            
            # Simulated outcome parameters or query live questions to compare
            before_score = body.get("beforeScore", 82)
            after_score = body.get("afterScore", 31)
            
            # Calculate gapReduction = (beforeScore - afterScore) / beforeScore
            gap_reduction = round((before_score - after_score) / before_score, 2) if before_score > 0 else 0.0
            
            intervention_id = str(uuid.uuid4())
            outcome_record = {
                "PK": f"COMMUNITY#{community_id}",
                "SK": f"INTERVENTION#{intervention_id}",
                "id": intervention_id,
                "gapId": event_rec.get("gapId") or "gap-rag-evaluation",
                "eventId": event_id,
                "beforeScore": before_score,
                "afterScore": after_score,
                "gapReduction": gap_reduction,
                "measuredAt": int(time.time())
            }
            
            put_item(outcome_record)
            
            # Also update event status
            event_rec["status"] = "completed"
            event_rec["attendance"] = body.get("attendance", 120)
            event_rec["questionsCount"] = body.get("questionsCount", 42)
            put_item(event_rec)
            
            return success(outcome_record)
            
        # Route: POST /notifications/test
        elif resource == "/notifications/test" and http_method == "POST":
            # Simple test endpoint to trigger SNS
            if ALERT_SNS_TOPIC_ARN:
                sns.publish(
                    TopicArn=ALERT_SNS_TOPIC_ARN,
                    Message=json.dumps({
                        "communityId": community_id,
                        "eventType": "TEST_ALERT",
                        "timestamp": int(time.time()),
                        "message": "This is a test notification for CommunityOS alerts."
                    })
                )
            return success({"message": "Test notification published successfully"})
            
        return error(400, "Unknown route")
        
    except Exception as e:
        return handle_exception(e)
