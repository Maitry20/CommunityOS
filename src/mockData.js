// CommunityOS v2 Seed Data (with Roles and Radar Coordinates)

export const seedResources = [
  { id: "r-1", title: "Evaluating RAG Triad Guardrails in Production", type: "session", source: "GenAI Builders #2", tags: ["rag", "evaluation", "guardrails"] },
  { id: "r-2", title: "Optimizing Vector Indexing for high write loads", type: "session", source: "Data Summit", tags: ["vector-db", "indexing", "performance"] },
  { id: "r-3", title: "Guide: Cost-efficient embedding cache architectures", type: "resource", source: "Community Wiki", tags: ["embeddings", "caching", "cost"] },
  { id: "r-4", title: "Preventing Prompt Injections: Boundary Defense", type: "resource", source: "AI Security Group", tags: ["security", "injection", "guardrails"] },
  { id: "r-5", title: "Why does my chunking fail on hierarchical PDFs?", type: "discussion", source: "Discord #rag-prod", tags: ["chunking", "pdf", "rag"] },
  { id: "r-6", title: "Pinecone vs PGVector write latencies under load", type: "discussion", source: "Discord #data-infra", tags: ["vector-db", "pgvector", "pinecone"] },
  { id: "r-7", title: "Hierarchical Supervisor Multi-Agent Design Patterns", type: "session", source: "Agentic Workshop", tags: ["multi-agent", "routing", "agents"] },
  { id: "r-8", title: "vLLM Offline Batch Inference Benchmarks", type: "resource", source: "Ollama Sandbox", tags: ["vllm", "local-llm", "inference"] },
  { id: "r-9", title: "How to handle token context size overflow?", type: "discussion", source: "Discord #llm-ops", tags: ["context", "tokens", "llm"] },
  { id: "r-10", title: "Structuring JSON schema output from raw text", type: "session", source: "Structured LLM Meetup", tags: ["json", "structured-output", "pydantic"] },
  { id: "r-11", title: "Guide: Building local dev sandboxes with Ollama", type: "resource", source: "LocalAI Lab", tags: ["local-llm", "ollama", "sandbox"] },
  { id: "r-12", title: "Solving connection pool starvation in PGVector", type: "discussion", source: "Discord #data-infra", tags: ["vector-db", "pgvector", "postgres"] },
  { id: "r-13", title: "Fine-Tuning Llama 3 on custom API schemas", type: "session", source: "GenAI Builders #3", tags: ["finetuning", "llama3", "api"] },
  { id: "r-14", title: "Evaluating agent trajectory using tracing toolkits", type: "resource", source: "Trace Wiki", tags: ["multi-agent", "tracing", "agents"] },
  { id: "r-15", title: "Has anyone successfully deployed Qwen 72B locally?", type: "discussion", source: "Discord #local-llm", tags: ["local-llm", "qwen", "hardware"] }
];

export const seedMembers = [
  { id: "m-1", name: "Elena Rostova", role: "Staff AI Engineer", skills: ["rag", "evaluation", "guardrails"], stuck: "Optimizing real-time LLM validation latency", experienceLine: "Solved a similar production-evaluation problem 2 months ago", bio: "Former researcher in prompt safety. Maintained RAG evaluation templates.", roles: ["seeking", "helping", "organizing"] },
  { id: "m-2", name: "Alex Rivera", role: "Backend Architect", skills: ["rag", "indexing", "chunking"], stuck: "Ingesting 100M+ PDF pages with correct metadata hierarchy", experienceLine: "Solved a similar index-synchronization problem 3 months ago", bio: "10+ years backend engineering. Built open source parsing pipelines.", roles: ["seeking", "helping"] },
  { id: "m-3", name: "Devon Chen", role: "Database Engineer", skills: ["vector-db", "pgvector", "performance"], stuck: "Benchmarking PGVector index build time on massive graphs", experienceLine: "Solved a similar PGVector latency problem 5 months ago", bio: "Postgres contributor. Specialized in database performance engineering.", roles: ["seeking", "helping"] },
  { id: "m-4", name: "Sarah Jenkins", role: "Security Researcher", skills: ["security", "injection", "guardrails"], stuck: "Testing jailbreaks on deepseek models", experienceLine: "Solved a similar injection-security problem 1 month ago", bio: "Securing LLMs since GPT-3. Creator of the safety-probe tool.", roles: ["seeking", "helping"] },
  { id: "m-5", name: "Tariq Mahmood", role: "Platform Engineer", skills: ["vllm", "local-llm", "inference"], stuck: "Scaling vLLM throughput under highly concurrent API requests", experienceLine: "Solved a similar local-inference speed problem 6 months ago", bio: "Kubernetes expert. Spends weekends squeezing tokens out of consumer GPUs.", roles: ["seeking", "organizing"] },
  { id: "m-6", name: "Hiroshi Sato", role: "ML Engineer", skills: ["multi-agent", "agents", "routing"], stuck: "Preventing loop traps in supervisor-agent routines", experienceLine: "Solved a similar agentic-routing problem 3 months ago", bio: "Built conversational systems for enterprise logistics automation.", roles: ["seeking"] },
  { id: "m-7", name: "Clara Dubois", role: "Data Scientist", skills: ["embeddings", "caching", "cost"], stuck: "Selecting optimal dimension reduction for cheap search queries", experienceLine: "Solved a similar embedding-cost problem 4 months ago", bio: "Focused on search optimization and clustering algorithms.", roles: ["seeking"] },
  { id: "m-8", name: "Marcus Vance", role: "Product Manager", skills: ["json", "structured-output"], stuck: "Defining strict API outputs for client-side web widgets", experienceLine: "Solved a similar JSON validation problem 2 months ago", bio: "Passionate about building developer platforms and API standards.", roles: ["seeking"] },
  { id: "m-9", name: "Anita Kumar", role: "Frontend Lead", skills: ["local-llm", "ollama", "sandbox"], stuck: "Syncing browser local storage with LLM state variables", experienceLine: "Solved a similar browser-sandbox integration problem 3 months ago", bio: "Design systems advocate. Enjoys prototyping local AI interfaces.", roles: ["seeking"] },
  { id: "m-10", name: "Lucas Meyer", role: "Infrastructure Architect", skills: ["postgres", "pgvector"], stuck: "Handling write connection spikes on multi-tenant DB setups", experienceLine: "Solved a similar database starvation problem 4 months ago", bio: "Scales databases for high-traffic financial applications.", roles: ["seeking"] },
  { id: "m-11", name: "Emma Smith", role: "AI Researcher", skills: ["finetuning", "llama3"], stuck: "Fine-tuning llama3 model with low quality context tokens", experienceLine: "Solved a similar fine-tuning pipeline problem 1 month ago", bio: "Llama enthusiast. Focuses on low-resource fine-tuning techniques.", roles: ["seeking"] },
  { id: "m-12", name: "James Wu", role: "MLOps Engineer", skills: ["multi-agent", "tracing"], stuck: "Tracking nested agent loops across network nodes", experienceLine: "Solved a similar tracing visualization problem 2 months ago", bio: "Maintains tracing instrumentation at a major automation startup.", roles: ["seeking"] },
  { id: "m-13", name: "Sofia Garcia", role: "Hardware Specialist", skills: ["local-llm", "qwen"], stuck: "Quantizing Qwen 72B to run smoothly on workstation rigs", experienceLine: "Solved a similar model quantization problem 5 months ago", bio: "Hardware blogger. Advises startups on server configurations.", roles: ["seeking"] },
  { id: "m-14", name: "Leo Kim", role: "Backend Engineer", skills: ["chunking", "pdf"], stuck: "Parsing scanned document images into clean text buffers", experienceLine: "Solved a similar OCR processing problem 4 months ago", bio: "Focuses on text extraction engines and pipeline optimization.", roles: ["seeking"] },
  { id: "m-15", name: "Olivia Taylor", role: "Data Engineer", skills: ["embeddings", "vector-db"], stuck: "Normalizing cosine distance scores across multiple models", experienceLine: "Solved a similar metric normalization problem 6 months ago", bio: "Specialized in vector database architecture and data pipelines.", roles: ["seeking"] },
  { id: "m-16", name: "Arthur Pendelton", role: "Security Analyst", skills: ["guardrails", "security"], stuck: "Evaluating safety filters on public-facing chatbot APIs", experienceLine: "Solved a similar safety-override problem 2 months ago", bio: "Performs penetration testing and LLM threat modeling.", roles: ["seeking"] },
  { id: "m-17", name: "Chloe Wang", role: "Backend Dev", skills: ["caching", "embeddings"], stuck: "Invalidating semantic cache when vector embeddings refresh", experienceLine: "Solved a similar cache-invalidation problem 3 months ago", bio: "API developer focused on caching layers and search performance.", roles: ["seeking"] },
  { id: "m-18", name: "Arjun Nair", role: "DevOps Engineer", skills: ["vllm", "inference"], stuck: "Automating rolling upgrades for GPU cluster pods", experienceLine: "Solved a similar GPU deployment problem 5 months ago", bio: "ML Infrastructure specialist. Automates scalable dev environments.", roles: ["seeking"] },
  { id: "m-19", name: "Zoe Martinez", role: "Software Engineer", skills: ["json", "pydantic"], stuck: "Enforcing Pydantic parser schema constraints on LLM outputs", experienceLine: "Solved a similar JSON parser validation problem 1 month ago", bio: "Backend engineer focused on data serialization and typing.", roles: ["seeking"] },
  { id: "m-20", name: "Oliver Hansen", role: "System Administrator", skills: ["ollama", "sandbox"], stuck: "Isolating local LLM process groups on server boxes", experienceLine: "Solved a similar system isolation problem 4 months ago", bio: "Maintains dev testing sandboxes and virtual machine clusters.", roles: ["seeking"] },
  { id: "m-21", name: "Isabella Rossi", role: "Data Architect", skills: ["postgres", "vector-db"], stuck: "Tuning index scan parameters for parallel table lookups", experienceLine: "Solved a similar database tuning problem 6 months ago", bio: "Database administrator specializing in high availability setups.", roles: ["seeking"] },
  { id: "m-22", name: "Liam Wilson", role: "ML Engineer", skills: ["finetuning", "llama3"], stuck: "Adapting tokenizer models for specialized medical terminology", experienceLine: "Solved a similar tokenizer adjustment problem 2 months ago", bio: "NLP researcher. Works on custom medical diagnostic applications.", roles: ["seeking"] },
  { id: "m-23", name: "Mia Petrovic", role: "Backend Developer", skills: ["multi-agent", "agents"], stuck: "Configuring state persistence layers for multi-step agent flows", experienceLine: "Solved a similar agent-state recovery problem 3 months ago", bio: "Develops asynchronous state machines and messaging pipelines.", roles: ["seeking"] },
  { id: "m-24", name: "Lucas Martin", role: "Infra Engineer", skills: ["tracing", "multi-agent"], stuck: "Exporting open telemetry metrics from agent nodes", experienceLine: "Solved a similar telemetry export problem 2 months ago", bio: "Implements logging and monitoring configurations across clusters.", roles: ["seeking"] },
  { id: "m-25", name: "Charlotte Bennett", role: "Fullstack Developer", skills: ["caching", "cost"], stuck: "Designing token counter meters for multi-tenant users", experienceLine: "Solved a similar usage metering problem 3 months ago", bio: "Builds user management and billing pipelines for SaaS products.", roles: ["seeking"] },
  { id: "m-26", name: "William Turner", role: "Data Engineer", skills: ["indexing", "chunking"], stuck: "Reducing indexing duplicate rates on continuous document feeds", experienceLine: "Solved a similar indexing deduping problem 4 months ago", bio: "Maintains real-time stream ingestion and data sync jobs.", roles: ["seeking"] },
  { id: "m-27", name: "Emily Watson", role: "App Developer", skills: ["rag", "caching"], stuck: "Retrieving history vectors dynamically for conversational memory", experienceLine: "Solved a similar conversation-history recall problem 1 month ago", bio: "Develops mobile and web applications utilizing AI assistant APIs.", roles: ["seeking"] },
  { id: "m-28", name: "Daniel Cooper", role: "Security Engineer", skills: ["security", "guardrails"], stuck: "Deploying API firewalls to prevent prompt injections", experienceLine: "Solved a similar firewall deployment problem 2 months ago", bio: "Secures application servers and cloud infrastructure endpoints.", roles: ["seeking"] },
  { id: "m-29", name: "Aria Takahashi", role: "AI Engineer", skills: ["vllm", "inference"], stuck: "Optimizing pipeline parallelism on multi-GPU server setups", experienceLine: "Solved a similar multi-GPU orchestrations problem 5 months ago", bio: "Focuses on high performance LLM serving and model optimization.", roles: ["seeking"] },
  { id: "m-30", name: "Gabriel Silva", role: "Software Architect", skills: ["multi-agent", "routing"], stuck: "Designing dynamic task routers based on runtime agent status", experienceLine: "Solved a similar workflow routing problem 3 months ago", bio: "System architect specializing in distributed system design.", roles: ["seeking"] }
];

export const radarGap = {
  topic: "Production RAG Evaluation",
  membersInterested: 18,
  unansweredCount: 14,
  action: "Production RAG Evaluation workshop",
  demandSignal: 18
};

export const radarTopics = [
  {
    id: "topic-1",
    name: "RAG Evaluation",
    expertise: 28,
    demand: 82,
    category: "gap",
    trajectory: [20, 28, 45, 52, 70, 82],
    unansweredCount: 14,
    action: "Recommend: Production RAG Evaluation workshop",
    speakers: [
      { name: "Elena Rostova", match: 98, role: "Staff AI Engineer", experienceLine: "Solved a similar production-evaluation problem 2 months ago" }
    ]
  },
  {
    id: "topic-2",
    name: "Prompt Injection Protection",
    expertise: 15,
    demand: 76,
    category: "gap",
    trajectory: [5, 10, 25, 40, 62, 76],
    unansweredCount: 9,
    action: "Recommend: Organize a Security Guardrails Hack-session",
    speakers: [
      { name: "Sarah Jenkins", match: 92, role: "Security Researcher", experienceLine: "Solved a similar injection-security problem 1 month ago" }
    ]
  },
  {
    id: "topic-3",
    name: "Vector DB Benchmarking",
    expertise: 82,
    demand: 89,
    category: "strength",
    trajectory: [40, 52, 60, 72, 85, 89],
    unansweredCount: 3,
    action: "Recommend: Share PGVector vs Pinecone whitepaper with #data-infra",
    speakers: [
      { name: "Devon Chen", match: 95, role: "Database Engineer", experienceLine: "Solved a similar PGVector latency problem 5 months ago" }
    ]
  },
  {
    id: "topic-4",
    name: "Chunking Strategies",
    expertise: 78,
    demand: 65,
    category: "strength",
    trajectory: [45, 50, 55, 62, 70, 65],
    unansweredCount: 2,
    action: "Recommend: Promote existing Chunk Overlap Wiki guide in general chat",
    speakers: [
      { name: "Alex Rivera", match: 91, role: "Backend Architect", experienceLine: "Solved a similar text-segmentation problem 3 months ago" }
    ]
  },
  {
    id: "topic-5",
    name: "Multi-Agent Routing",
    expertise: 58,
    demand: 72,
    category: "emerging",
    trajectory: [10, 18, 32, 45, 60, 72],
    unansweredCount: 8,
    action: "Recommend: Schedule a Multi-Agent Routing panel",
    speakers: [
      { name: "Hiroshi Sato", match: 89, role: "ML Engineer", experienceLine: "Solved a similar agentic-routing problem 3 months ago" }
    ]
  },
  {
    id: "topic-6",
    name: "Local LLM Serving",
    expertise: 48,
    demand: 52,
    category: "emerging",
    trajectory: [20, 24, 30, 38, 45, 52],
    unansweredCount: 5,
    action: "Recommend: Setup Ollie/vLLM sandbox environment for the community",
    speakers: [
      { name: "Tariq Mahmood", match: 76, role: "Platform Engineer", experienceLine: "Solved a similar local-inference speed problem 6 months ago" }
    ]
  }
];
