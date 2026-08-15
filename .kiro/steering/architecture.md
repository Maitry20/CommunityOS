---
inclusion: always
---

# CommunityOS — Architecture & Technology

## Technology Stack

### Frontend
- React 19 (current)
- TypeScript (target — migrate from JSX incrementally)
- Tailwind CSS 4 (via Vite plugin)
- Vite 8 for build tooling
- React Router DOM 7 for client-side routing
- Lucide React for icons

### Backend (Target)
- Python
- FastAPI for HTTP APIs
- Serverless deployment on AWS Lambda

### Cloud — AWS
- Amazon S3 — raw files and community artifacts (recordings, slides, transcripts)
- AWS Lambda — serverless processing
- Amazon API Gateway — API layer
- Amazon DynamoDB — application data
- Amazon Bedrock — generative AI (extraction, classification, summarization, recommendations)
- Amazon OpenSearch Serverless — semantic search and vector retrieval
- Amazon CloudWatch — observability
- AWS IAM — access control
- AWS Secrets Manager — secrets management

Do not introduce additional technologies without a clear architectural reason.
Prefer managed AWS services and simple architecture over unnecessary infrastructure complexity.

## Architecture Principles

### Prefer
- Modular architecture
- Clear separation of frontend, API, business logic, data, and AI layers
- Serverless AWS components where practical
- Asynchronous processing for expensive ingestion/AI tasks
- Event-driven processing where appropriate
- Strong validation
- Observable pipelines
- Secure handling of credentials
- Scalable data ingestion
- Traceable AI outputs

### Avoid
- Unnecessary microservices
- Hard-coded secrets
- Tightly coupled components
- Duplicated business logic
- Generic AI features without a concrete product purpose
- Building features that do not contribute to Radar, Memory, or Connect

## AI Architecture Principles

AI is NOT a generic chatbot. Use AI for:
- Information extraction
- Topic classification
- Semantic understanding
- Summarization
- Entity extraction
- Relationship discovery
- Knowledge-gap detection
- Trend detection
- Recommendation generation
- Natural-language explanations

AI outputs must be:
- Grounded in stored community data whenever possible
- Free from hallucinated member expertise, events, resources, or community trends
- Traceable to source data
- Scored with confidence where appropriate

## Current Frontend Architecture

The app currently lives in a single-page React application:
- `App.jsx` — root component, all state management, profile drawer, header/nav
- `src/pages/LoginPage.jsx` — role selection and sign-in
- `src/pages/SetupPage.jsx` — profile creation
- `src/pages/DashboardPage.jsx` — role-based dashboard (Learner, Pro, Organizer)
- `src/mockData.js` — seed data for members, resources, radar topics
- State persisted via localStorage (users, contributions, community links)

### Design System
- AWS-inspired dark console theme
- Color palette: `#0f141c` (base bg), `#161b24` (panel bg), `#353f4d` (borders)
- Semantic colors: `#ec7211` (gap/warning), `#0972d3` (strength/info), `#ff9900` (accent/emerging)
- Fonts: Inter (sans), JetBrains Mono (mono)
- Components use font-mono uppercase labels, squared borders, minimal radius
