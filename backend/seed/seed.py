import boto3
import time
import os

# Initialize table resource
TABLE_NAME = os.environ.get("TABLE_NAME", "CommunityOSTable")
dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
table = dynamodb.Table(TABLE_NAME)

MEMBERS = [
    {"id": "m-1", "name": "Elena Rostova", "role": "Staff AI Engineer", "skills": ["rag", "evaluation", "guardrails"], "stuck": "Optimizing real-time LLM validation latency", "experienceLine": "Solved a similar production-evaluation problem 2 months ago", "bio": "Former researcher in prompt safety. Maintained RAG evaluation templates.", "roles": ["seeking", "helping", "organizing"]},
    {"id": "m-2", "name": "Alex Rivera", "role": "Backend Architect", "skills": ["rag", "indexing", "chunking"], "stuck": "Ingesting 100M+ PDF pages with correct metadata hierarchy", "experienceLine": "Solved a similar index-synchronization problem 3 months ago", "bio": "10+ years backend engineering. Built open source parsing pipelines.", "roles": ["seeking", "helping"]},
    {"id": "m-3", "name": "Devon Chen", "role": "Database Engineer", "skills": ["vector-db", "pgvector", "performance"], "stuck": "Benchmarking PGVector index build time on massive graphs", "experienceLine": "Solved a similar PGVector latency problem 5 months ago", "bio": "Postgres contributor. Specialized in database performance engineering.", "roles": ["seeking", "helping"]},
    {"id": "m-4", "name": "Sarah Jenkins", "role": "Security Researcher", "skills": ["security", "injection", "guardrails"], "stuck": "Testing jailbreaks on deepseek models", "experienceLine": "Solved a similar injection-security problem 1 month ago", "bio": "Securing LLMs since GPT-3. Creator of the safety-probe tool.", "roles": ["seeking", "helping"]},
    {"id": "m-5", "name": "Tariq Mahmood", "role": "Platform Engineer", "skills": ["vllm", "local-llm", "inference"], "stuck": "Scaling vLLM throughput under highly concurrent API requests", "experienceLine": "Solved a similar local-inference speed problem 6 months ago", "bio": "Kubernetes expert. Spends weekends squeezing tokens out of consumer GPUs.", "roles": ["seeking", "organizing"]},
    {"id": "m-6", "name": "Hiroshi Sato", "role": "ML Engineer", "skills": ["multi-agent", "agents", "routing"], "stuck": "Preventing loop traps in supervisor-agent routines", "experienceLine": "Solved a similar agentic-routing problem 3 months ago", "bio": "Built conversational systems for enterprise logistics automation.", "roles": ["seeking", "helping"]},
    {"id": "m-7", "name": "Clara Dubois", "role": "Data Scientist", "skills": ["embeddings", "caching", "cost"], "stuck": "Selecting optimal dimension reduction for cheap search queries", "experienceLine": "Solved a similar embedding-cost problem 4 months ago", "bio": "Focused on search optimization and clustering algorithms.", "roles": ["seeking"]},
    {"id": "m-8", "name": "Marcus Vance", "role": "Product Manager", "skills": ["json", "structured-output"], "stuck": "Defining strict API outputs for client-side web widgets", "experienceLine": "Solved a similar JSON validation problem 2 months ago", "bio": "Passionate about building developer platforms and API standards.", "roles": ["seeking"]},
    {"id": "m-9", "name": "Anita Kumar", "role": "Frontend Lead", "skills": ["local-llm", "ollama", "sandbox"], "stuck": "Syncing browser local storage with LLM state variables", "experienceLine": "Solved a similar browser-sandbox integration problem 3 months ago", "bio": "Design systems advocate. Enjoys prototyping local AI interfaces.", "roles": ["seeking", "helping"]},
    {"id": "m-10", "name": "Lucas Meyer", "role": "Infrastructure Architect", "skills": ["postgres", "pgvector"], "stuck": "Handling write connection spikes on multi-tenant DB setups", "experienceLine": "Solved a similar database starvation problem 4 months ago", "bio": "Scales databases for high-traffic financial applications.", "roles": ["seeking", "helping"]}
]

# Create remaining 20 members to reach 30
for i in range(11, 31):
    MEMBERS.append({
        "id": f"m-{i}",
        "name": f"Member {i}",
        "role": "Software Engineer",
        "skills": ["rag", "development"],
        "stuck": "General deployment optimization issues",
        "experienceLine": "Solved a general engineering problem 3 months ago",
        "bio": "General fullstack software developer interested in AI.",
        "roles": ["seeking"]
    })

RESOURCES = [
    {"id": "r-1", "title": "Evaluating RAG Triad Guardrails in Production", "type": "session", "source": "GenAI Builders #2", "tags": ["rag", "evaluation", "guardrails"]},
    {"id": "r-2", "title": "Optimizing Vector Indexing for high write loads", "type": "session", "source": "Data Summit", "tags": ["vector-db", "indexing", "performance"]},
    {"id": "r-3", "title": "Guide: Cost-efficient embedding cache architectures", "type": "resource", "source": "Community Wiki", "tags": ["embeddings", "caching", "cost"]},
    {"id": "r-4", "title": "Preventing Prompt Injections: Boundary Defense", "type": "resource", "source": "AI Security Group", "tags": ["security", "injection", "guardrails"]},
    {"id": "r-5", "title": "Why does my chunking fail on hierarchical PDFs?", "type": "discussion", "source": "Discord #rag-prod", "tags": ["chunking", "pdf", "rag"]}
]

def seed_db():
    print(f"Seeding table '{TABLE_NAME}'...")
    community_id = "demo-community"
    
    # 1. Seed Community
    table.put_item(Item={
        "PK": f"COMMUNITY#{community_id}",
        "SK": "METADATA",
        "id": community_id,
        "name": "AWS GenAI Builders Community",
        "createdAt": int(time.time())
    })
    
    # 2. Seed Members and Pros
    for m in MEMBERS:
        # Create Member Record
        member_rec = {
            "PK": f"COMMUNITY#{community_id}",
            "SK": f"MEMBER#{m['id']}",
            "GSI1PK": f"MEMBER#{m['id']}",
            "GSI1SK": "METADATA",
            "id": m["id"],
            "communityId": community_id,
            "name": m["name"],
            "email": f"{m['id']}@example.com",
            "roleTitle": m["role"],
            "skills": m["skills"],
            "focus": m["stuck"],
            "openToMatching": True,
            "picUrl": None,
            "roles": m["roles"],
            "bio": m["bio"]
        }
        table.put_item(Item=member_rec)
        
        # If helping, also create Pro Record
        if "helping" in m["roles"]:
            prev_help = []
            if m["id"] == "m-1":
                # Elena has production RAG evaluation experience
                prev_help = [{
                    "id": "h-1",
                    "topic": "Production RAG evaluation",
                    "timeframe": "2 months ago",
                    "description": "Helped community members with RAG evaluation pipelines"
                }]
            elif m["id"] == "m-2":
                prev_help = [{
                    "id": "h-2",
                    "topic": "PDF Ingestion pipelines",
                    "timeframe": "3 months ago",
                    "description": "Solved PDF text extraction pipeline issues"
                }]
            else:
                prev_help = [{
                    "id": f"h-{m['id']}",
                    "topic": "General coding help",
                    "timeframe": "1 month ago",
                    "description": "Helped with general engineering tasks"
                }]
                
            pro_rec = {
                "PK": f"COMMUNITY#{community_id}",
                "SK": f"PRO#{m['id']}",
                "GSI1PK": f"PRO#{m['id']}",
                "GSI1SK": "METADATA",
                "id": m["id"],
                "communityId": community_id,
                "name": m["name"],
                "title": m["role"],
                "skills": m["skills"],
                "interests": m["skills"],
                "currentFocus": m["stuck"],
                "openToMatching": True,
                "previousHelp": prev_help,
                "communityActivity": {"sessionsAttended": 5, "questionsAnswered": 3},
                "sessionsAttended": 5,
                "questionsAnswered": 3,
                "talksGiven": 1
            }
            table.put_item(Item=pro_rec)

    # 3. Seed Resources
    for r in RESOURCES:
        table.put_item(Item={
            "PK": f"COMMUNITY#{community_id}",
            "SK": f"RESOURCE#{r['id']}",
            "id": r["id"],
            "communityId": community_id,
            "title": r["title"],
            "type": r["type"],
            "source": r["source"],
            "tags": r["tags"],
            "url": "https://example.com/resource",
            "summary": "This is a seeded community learning resource.",
            "topic": r["tags"][0] if r["tags"] else "General",
            "createdAt": int(time.time())
        })

    # 4. Seed Questions (to show Production RAG Evaluation gap)
    # Target gap: Production RAG Evaluation has 14 unanswered questions, 18 interested members
    for i in range(1, 15):
        table.put_item(Item={
            "PK": f"COMMUNITY#{community_id}",
            "SK": f"QUESTION#q-{i}",
            "GSI1PK": f"QUESTION#q-{i}",
            "GSI1SK": "METADATA",
            "id": f"q-{i}",
            "communityId": community_id,
            "title": f"Question {i} about RAG Evaluation",
            "content": "How do we validate RAG accuracy in a staging environment?",
            "askedBy": f"m-{10 + i}",
            "topic": "Production RAG Evaluation",
            "answered": False,
            "createdAt": int(time.time() - (i * 3600))
        })
        
    # Some answered questions to add to statistics
    for i in range(15, 20):
        table.put_item(Item={
            "PK": f"COMMUNITY#{community_id}",
            "SK": f"QUESTION#q-{i}",
            "GSI1PK": f"QUESTION#q-{i}",
            "GSI1SK": "METADATA",
            "id": f"q-{i}",
            "communityId": community_id,
            "title": f"Question {i} about PGVector Performance",
            "content": "How do we benchmark query throughput?",
            "askedBy": f"m-{i}",
            "topic": "Vector DB Benchmarking",
            "answered": True,
            "answerContent": "We can tune index build parameters and memory settings.",
            "createdAt": int(time.time() - (i * 3600))
        })

    # 5. Seed Events
    table.put_item(Item={
        "PK": f"COMMUNITY#{community_id}",
        "SK": "EVENT#e-1",
        "GSI1PK": "EVENT#e-1",
        "GSI1SK": "METADATA",
        "id": "e-1",
        "communityId": community_id,
        "name": "GenAI Builders Meetup #2",
        "topic": "Production RAG Evaluation",
        "attendance": 120,
        "questionsCount": 42,
        "topTopic": "Production RAG Evaluation",
        "photoUrl": None,
        "status": "completed",
        "createdAt": int(time.time() - 86400)
    })

    # 6. Seed Connections & Matches for Learner and Pro
    # Pending requests for Pro m-1 (Elena Rostova)
    table.put_item(Item={
        "PK": f"COMMUNITY#{community_id}",
        "SK": "CONNECTION#req-1",
        "GSI1PK": "PRO#m-1",
        "GSI1SK": "CONNECTION#req-1",
        "id": "req-1",
        "connectionId": "req-1",
        "learnerId": "m-11",
        "proId": "m-1",
        "status": "pending",
        "question": "How do I handle token context size overflow in Llama 3?",
        "name": "Emma Smith",
        "createdAt": int(time.time() - 3600),
        "communityId": community_id
    })

    table.put_item(Item={
        "PK": f"COMMUNITY#{community_id}",
        "SK": "CONNECTION#req-2",
        "GSI1PK": "PRO#m-1",
        "GSI1SK": "CONNECTION#req-2",
        "id": "req-2",
        "connectionId": "req-2",
        "learnerId": "m-6",
        "proId": "m-1",
        "status": "pending",
        "question": "Best practices for chunking hierarchical PDFs cleanly.",
        "name": "Hiroshi Sato",
        "createdAt": int(time.time() - 7200),
        "communityId": community_id
    })

    # Accepted connection match for Learner m-11 (Emma Smith)
    table.put_item(Item={
        "PK": f"COMMUNITY#{community_id}",
        "SK": "CONNECTION#conn-1",
        "GSI1PK": "PRO#m-3",
        "GSI1SK": "CONNECTION#conn-1",
        "id": "conn-1",
        "connectionId": "conn-1",
        "learnerId": "m-11",
        "proId": "m-3",
        "status": "accepted",
        "name": "Devon Chen",
        "role": "Database Engineer",
        "experienceLine": "Solved a similar PGVector latency problem 5 months ago",
        "createdAt": int(time.time() - 86400),
        "communityId": community_id
    })

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
