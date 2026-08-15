---
inclusion: always
---

# CommunityOS — Agent Behavior Guidelines

## Working Principles

When working on this project:

1. Understand existing code before making changes
2. Follow steering documentation
3. Prefer the simplest architecture that satisfies the requirement
4. Ask for clarification when a requirement is genuinely ambiguous
5. Do not invent APIs, database schemas, AWS resources, or product requirements without evidence
6. Preserve existing functionality unless the requested feature requires a change
7. Explain important architectural decisions
8. Keep Radar as the primary product differentiator
9. Ensure AI features are grounded in community data
10. Prefer incremental implementation over large rewrites

## Spec Workflow

For significant features, follow this workflow:

**Requirements → Design → Implementation Tasks → Implementation → Testing → Review**

- Do not immediately implement large features from a single high-level request
- First create or update the appropriate specification
- Break complex work into well-defined tasks

## Feature Evaluation

Before implementing a major feature, evaluate whether it improves the core CommunityOS story:

> "Understand the community → discover what is missing → identify who/what can help → recommend what should happen next."

If a feature does not strengthen this narrative, deprioritize it.

## Hackathon Priority

This is a hackathon project. Prioritize:

1. A compelling end-to-end demo
2. Radar as the hero experience
3. A working ingestion → intelligence → insight pipeline
4. Clear evidence behind AI-generated insights
5. Strong visual presentation
6. Reliable implementation
7. AWS integration
8. Simplicity over unnecessary feature breadth

Avoid spending excessive time on secondary features that do not strengthen the core demonstration.

## Decision Framework

When faced with implementation choices:

| Situation | Action |
|-----------|--------|
| Feature supports Radar | High priority, implement |
| Feature supports Memory/Connect for Radar | Medium priority |
| Feature is pure CRUD with no intelligence | Low priority unless blocking |
| Feature adds generic AI without product purpose | Skip |
| Feature requires new AWS service | Justify the addition |
| Feature rewrites working code | Only if required by new feature |

## Code Change Checklist

Before submitting changes:

- [ ] Does the change align with product philosophy?
- [ ] Does it follow existing frontend patterns (colors, layout, naming)?
- [ ] Is state management consistent with current approach?
- [ ] Are no secrets or credentials exposed?
- [ ] Does existing functionality still work?
- [ ] Is the change incremental and focused?
- [ ] For AI features: is the output grounded in data?

## What NOT To Do

- Do not add a chatbot interface
- Do not build generic CRUD admin panels unless they directly serve Radar/Memory/Connect
- Do not introduce new state management libraries without justification
- Do not change the visual theme without explicit request
- Do not add backend infrastructure that isn't needed for the current feature
- Do not hallucinate community data in AI outputs
- Do not break existing role-based dashboard flows
