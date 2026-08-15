import json
import os
import boto3
from common.auth import parse_auth
from common.response import success, error, handle_exception
from common.db import query_items

# Boto3 clients
bedrock_runtime = boto3.client("bedrock-runtime", region_name="us-east-1")
bedrock_agent = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

KNOWLEDGE_BASE_ID = os.environ.get("BEDROCK_KNOWLEDGE_BASE_ID")

def query_llm_titan(prompt):
    """
    Invokes Titan or Claude on Bedrock depending on what is available.
    """
    try:
        # Defaulting to Titan Text Express
        body = json.dumps({
            "inputText": prompt,
            "textGenerationConfig": {
                "maxTokenCount": 512,
                "stopSequences": [],
                "temperature": 0,
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
        print(f"Titan invocation failed: {e}. Trying Claude Haiku...")
        try:
            # Fallback to Claude 3 Haiku
            body = json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 512,
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
            print(f"Claude invocation also failed: {e2}. Returning fallback response.")
            return None

def retrieve_from_kb(query, community_id):
    """
    Retrieves relevant document chunks from Bedrock Knowledge Base.
    """
    if not KNOWLEDGE_BASE_ID or KNOWLEDGE_BASE_ID == "dummy-kb-id":
        return []
    try:
        response = bedrock_agent.retrieve(
            knowledgeBaseId=KNOWLEDGE_BASE_ID,
            retrievalQuery={"text": query},
            retrievalConfiguration={
                "vectorSearchConfiguration": {
                    "numberOfResults": 3,
                    "filter": {
                        "equals": {
                            "key": "communityId",
                            "value": community_id
                        }
                    }
                }
            }
        )
        return response.get("retrievalResults", [])
    except Exception as e:
        print(f"Knowledge Base retrieval failed: {e}")
        return []

def handler(event, context):
    try:
        user_id, community_id, role = parse_auth(event)
        body = json.loads(event.get("body", "{}"))
        query_text = body.get("query")
        
        if not query_text:
            return error(400, "Missing query parameter")
            
        # 1. Retrieve relevant sources from Bedrock KB
        kb_results = retrieve_from_kb(query_text, community_id)
        
        # Format sources
        sources = []
        context_texts = []
        for res in kb_results:
            text = res.get("content", {}).get("text", "")
            location = res.get("location", {}).get("s3Location", {}).get("uri", "")
            context_texts.append(text)
            sources.append({
                "text": text,
                "location": location,
                "score": res.get("score", 0.0)
            })
            
        # 2. Query DynamoDB for community resources and sessions matching terms
        all_resources = query_items(f"COMMUNITY#{community_id}", "RESOURCE#")
        all_sessions = query_items(f"COMMUNITY#{community_id}", "SESSION#")
        
        query_words = set(query_text.lower().split())
        matched_resources = []
        matched_sessions = []
        
        for res in all_resources:
            title = res.get("title", "").lower()
            tags = [t.lower() for t in res.get("tags", [])]
            if any(w in title for w in query_words if len(w) > 2) or any(any(w in t or t in w for w in query_words if len(w) > 2) for t in tags):
                matched_resources.append(res)
                
        for sess in all_sessions:
            title = sess.get("title", "").lower()
            topic = sess.get("topic", "").lower()
            if any(w in title for w in query_words if len(w) > 2) or (topic in query_text.lower()):
                matched_sessions.append(sess)
                
        # Fallback to top community resources if no direct tag matches found
        if not matched_resources and all_resources:
            matched_resources = all_resources[:3]
                
        # 3. Generate grounded response
        if context_texts:
            context_block = "\n---\n".join(context_texts)
            prompt = (
                f"You are a helpful community assistant for CommunityOS. "
                f"Answer the user's question based strictly on the provided community context. "
                f"If the context is empty or does not contain enough information, explain that the community doesn't have this info. "
                f"\n\nContext:\n{context_block}\n\nQuestion: {query_text}\nAnswer:"
            )
            answer = query_llm_titan(prompt)
        else:
            answer = None
            
        # Fallback if no context or LLM invocation returned nothing
        if not answer:
            if matched_resources or matched_sessions:
                answer = "Here are some relevant topics and resources found in our community database."
            else:
                answer = "The community does not currently have enough information to answer this question. Try asking about other topics like Production RAG Evaluation."
                
        return success({
            "answer": answer,
            "resources": matched_resources[:3],
            "sessions": matched_sessions[:3],
            "sources": sources
        })
        
    except Exception as e:
        return handle_exception(e)
