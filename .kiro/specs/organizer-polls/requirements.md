# Requirements Document

## Introduction

This feature adds a polling system to CommunityOS that enables Organizers to create polls targeting Learners and Pros. Polls serve as a direct feedback mechanism, allowing Organizers to understand community needs, preferences, and opinions. Poll responses feed into the Radar intelligence story by providing structured demand signals and community sentiment data.

This is a frontend-only hackathon prototype using localStorage and React state for persistence — no real backend required.

## Glossary

- **Poll_System**: The frontend module responsible for creating, storing, displaying, and tallying polls within CommunityOS
- **Organizer**: A user with the "organizer" role who creates and manages polls
- **Respondent**: A Learner or Pro user who views and responds to polls on their dashboard
- **Poll**: A question with multiple answer options created by an Organizer, targeted at Learners and Pros
- **Poll_Option**: A single selectable answer choice within a Poll
- **Poll_Response**: A recorded vote by a Respondent for a specific Poll_Option
- **Poll_Results**: The aggregated vote counts and percentages for all options in a Poll
- **Target_Audience**: The set of roles (Learner, Pro, or both) that a Poll is shown to

## Requirements

### Requirement 1: Create Poll

**User Story:** As an Organizer, I want to create a poll with a question and multiple answer options, so that I can gather structured feedback from the community.

#### Acceptance Criteria

1. WHEN the Organizer submits the poll creation form with a question and at least two options, THE Poll_System SHALL create a new Poll and persist it to localStorage
2. THE Poll_System SHALL require a non-empty question text of at most 200 characters
3. THE Poll_System SHALL require at least two and at most five Poll_Options, each with non-empty text of at most 100 characters
4. THE Poll_System SHALL allow the Organizer to select a Target_Audience of "Learners only", "Pros only", or "Both"
5. WHEN the Organizer submits the form with invalid input, THE Poll_System SHALL display an inline validation message indicating the specific field that failed validation
6. THE Poll_System SHALL assign each new Poll a unique identifier and a creation timestamp

### Requirement 2: Display Polls on Respondent Dashboards

**User Story:** As a Learner or Pro, I want to see active polls on my dashboard, so that I can provide feedback to the Organizer.

#### Acceptance Criteria

1. WHILE a Respondent is viewing their dashboard, THE Poll_System SHALL display all active Polls whose Target_Audience includes the Respondent's role
2. THE Poll_System SHALL display each Poll with its question text and all Poll_Options as selectable choices
3. THE Poll_System SHALL display Polls in reverse chronological order based on creation timestamp
4. WHEN no active Polls exist for the Respondent's role, THE Poll_System SHALL display a message stating "No polls available"

### Requirement 3: Submit Poll Response

**User Story:** As a Learner or Pro, I want to vote on a poll, so that the Organizer can understand my preferences.

#### Acceptance Criteria

1. WHEN a Respondent selects a Poll_Option and confirms their vote, THE Poll_System SHALL record the Poll_Response and persist it to localStorage
2. THE Poll_System SHALL allow each Respondent to vote only once per Poll
3. WHEN a Respondent has already voted on a Poll, THE Poll_System SHALL display the Poll_Results instead of the voting interface
4. WHEN a Respondent submits a vote, THE Poll_System SHALL immediately display the updated Poll_Results for that Poll

### Requirement 4: View Poll Results as Organizer

**User Story:** As an Organizer, I want to see poll results with vote counts and percentages, so that I can understand community sentiment and use it for planning.

#### Acceptance Criteria

1. WHILE the Organizer is viewing their dashboard, THE Poll_System SHALL display all created Polls with their current Poll_Results
2. THE Poll_System SHALL display each Poll_Option with its vote count and percentage of total votes
3. THE Poll_System SHALL display the total number of responses for each Poll
4. WHEN a Poll has zero responses, THE Poll_System SHALL display the Poll with a "No responses yet" indicator
5. THE Poll_System SHALL visually highlight the leading Poll_Option using the accent color

### Requirement 5: Delete Poll

**User Story:** As an Organizer, I want to delete a poll I created, so that I can remove outdated or irrelevant polls from the community view.

#### Acceptance Criteria

1. WHEN the Organizer confirms deletion of a Poll, THE Poll_System SHALL remove the Poll and all associated Poll_Responses from localStorage
2. THE Poll_System SHALL request confirmation before deleting a Poll
3. WHEN a Poll is deleted, THE Poll_System SHALL immediately remove the Poll from all Respondent dashboards
