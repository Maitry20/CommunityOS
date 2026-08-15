---
inclusion: always
---

# CommunityOS — Data Model & Relationships

## Core Entities

The system should conceptually understand these entities:

| Entity | Description |
|--------|-------------|
| Community | The top-level container for all activity |
| Member | A person participating in the community |
| Event | A meetup, workshop, conference, or gathering |
| Session | A talk, presentation, or workshop within an event |
| Speaker | A person who presented a session |
| Recording | Audio/video capture of a session |
| Transcript | Text transcription of a recording |
| Slide Deck | Presentation materials from a session |
| Question | A question asked at an event, in a discussion, or on a platform |
| Answer | A response to a question |
| Resource | An article, guide, tutorial, tool, or reference material |
| GitHub Repository | A code project associated with the community |
| Project | A broader initiative that may span multiple repos/resources |
| Topic | A subject area (e.g., "RAG evaluation", "PGVector performance") |
| Skill | A capability possessed by a member |
| Discussion | A threaded conversation (Discord, Slack, forum) |
| Contribution | A member's act of sharing knowledge (talk, post, PR, answer) |
| Knowledge Gap | A detected area where community demand exceeds expertise |
| Emerging Trend | A topic with growing interest over time |
| Radar Insight | An AI-generated intelligence observation |
| Recommendation | A suggested action for the community |

## Key Relationships

```
Member → attended → Event
Member → has_expertise_in → Topic
Member → contributed_to → Project
Member → asked → Question
Member → answered → Question
Member → shared → Resource
Speaker → presented → Session
Session → covers → Topic
Session → part_of → Event
Session → has → Recording
Session → has → Transcript
Session → has → Slide Deck
Question → asked_at → Event
Question → about → Topic
Resource → supports → Topic
Discussion → about → Topic
Discussion → on_platform → (Discord/Slack/Forum)
GitHub Repository → related_to → Topic
Knowledge Gap → detected_from → Questions + Discussions + Events
Emerging Trend → evidenced_by → Community Activity over Time
Radar Insight → supported_by → Community Data
Recommendation → addresses → Knowledge Gap | Emerging Trend
```

## Current Mock Data Structure

The frontend currently uses simplified in-memory data:

### seedMembers
```
{ id, name, role, skills[], stuck, experienceLine, bio, roles[] }
```
- `roles` array: "seeking", "helping", "organizing"
- `skills` array: tag strings matching topic keywords

### seedResources
```
{ id, title, type, source, tags[] }
```
- `type`: "session" | "resource" | "discussion"

### radarTopics
```
{ id, name, expertise, demand, category, trajectory[], unansweredCount, action, speakers[] }
```
- `category`: "gap" | "strength" | "emerging"
- `trajectory`: array of 6 numeric values representing demand over time
- `speakers[].match`: percentage match score

### Events (in App state)
```
{ id, name, attendance, questions, topTopic, photo }
```

### Shared Contributions (localStorage)
```
{ id, title, type, url, summary, author, authorRole, platform, tags[], date }
```

### Community Links (localStorage)
```
{ id, name, type, url, description }
```

## Data Evolution Strategy

The mock data serves as the shape for the eventual backend schema. When building backend services:

1. Maintain compatibility with the current frontend data shapes
2. Add new fields incrementally (don't break existing views)
3. Prefer denormalized reads for dashboard performance
4. Use DynamoDB single-table design patterns where appropriate
5. Store raw/unstructured data in S3, structured metadata in DynamoDB
6. Vector embeddings in OpenSearch Serverless for semantic search
