---
inclusion: fileMatch
fileMatchPattern: "**/mockData*,**/radar*,**/Radar*,**/Dashboard*"
---

# CommunityOS — Radar Scoring & Intelligence Logic

## Radar Categories

Every topic in the Radar system is classified into one of three categories:

| Category | Definition | Visual Color |
|----------|-----------|--------------|
| **Gap** | Community demand significantly exceeds available expertise | `#ec7211` (Deep Orange) |
| **Strength** | High expertise matches or exceeds demand | `#0972d3` (AWS Blue) |
| **Emerging** | Growing interest with moderate/building expertise | `#ff9900` (Bright Orange) |

## Scoring Model

### Demand Score (0–100)
Calculated from:
- Number of unanswered questions about the topic
- Frequency of the topic in recent discussions
- Number of members expressing interest or being "stuck" on the topic
- Recency-weighted (recent activity scores higher)

### Expertise Score (0–100)
Calculated from:
- Number of members with the topic in their skills
- Members who have presented sessions on the topic
- Members who have answered questions about the topic
- Members who have contributed resources/code related to the topic
- Quality-weighted (speakers and answerers score higher than self-reported)

### Category Classification Logic
```
IF expertise < 40 AND demand > 60 → "gap"
IF expertise >= 70 AND demand >= 50 → "strength"  
IF trajectory shows >30% growth over last 3 periods → "emerging"
ELSE classify by largest gap between demand and expertise
```

### Trajectory
- Array of 6 numeric values representing demand over time (e.g., monthly snapshots)
- Used to detect emerging topics (consistent upward trend)
- Used to detect declining interest (downward trend)
- Visualized as sparklines or mini charts

## Insight Generation

Each Radar insight should include:

1. **Topic name** — what the insight is about
2. **Category** — gap, strength, or emerging
3. **Demand score** — numeric
4. **Expertise score** — numeric
5. **Trajectory** — trend direction and data points
6. **Unanswered count** — concrete number of open questions
7. **Suggested action** — what the community should do
8. **Matched speakers/experts** — who can help (with match %)
9. **Evidence sources** — which events, discussions, questions support this

## Recommendation Logic

Recommendations are generated based on category:

### For Gaps
- "Schedule a workshop on [topic]"
- "Invite [matched expert] to present"
- "Create a resource guide for [topic]"
- "Start a dedicated Discord channel for [topic]"

### For Strengths
- "Share existing [resource] more broadly"
- "Feature [expert] in community spotlight"
- "Create a mentorship track for [topic]"

### For Emerging
- "Monitor [topic] — interest growing"
- "Schedule an exploratory panel on [topic]"
- "Connect interested members for peer learning"

## Speaker/Expert Matching

Match percentage is calculated from:
- Skill overlap with the topic (primary factor)
- Past presentations on related topics
- Past answers to related questions
- Recency of relevant contributions
- Availability/willingness (openToMatch flag)

## Current Mock Implementation

The `radarTopics` array in `mockData.js` uses this structure:
```javascript
{
  id: "topic-1",
  name: "RAG Evaluation",
  expertise: 28,        // 0-100 score
  demand: 82,           // 0-100 score
  category: "gap",      // derived from scores
  trajectory: [20, 28, 45, 52, 70, 82],  // 6 time points
  unansweredCount: 14,
  action: "Recommend: Production RAG Evaluation workshop",
  speakers: [
    { name: "Elena Rostova", match: 98, role: "Staff AI Engineer", experienceLine: "..." }
  ]
}
```

When building real Radar intelligence, maintain this shape but compute values from actual community data rather than hard-coded mock values.
