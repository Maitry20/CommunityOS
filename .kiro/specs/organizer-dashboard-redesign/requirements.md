# Requirements Document

## Introduction

This specification covers the redesign of the Organizer dashboard in CommunityOS to align with the product vision of Radar as the hero experience. The redesign removes decorative UI elements (region selector, shared bulletin board, Connect & Join links section) and focuses the Organizer dashboard on community intelligence: gaps detected, emerging topics, community strengths, gap cards with suggested experts, event engagement metrics, event photo upload, and community link management.

## Glossary

- **Organizer_Dashboard**: The primary view shown to users with the "organizer" role after sign-in, displaying community intelligence and event engagement data
- **Header**: The top navigation bar rendered across all authenticated pages containing the application logo, role indicator, sign-out button, and profile avatar
- **Region_Selector**: A decorative UI element in the Header displaying "N. Virginia us-east-1" styled as an AWS console region picker
- **Top_Counters**: A summary bar showing three key community intelligence metrics: gaps detected, emerging topics, and community strengths
- **Gap_Card**: A UI card displaying a detected community knowledge gap including topic name, demand score, description, and suggested expert(s) to feature
- **Event_Engagement_Table**: A sortable table showing past events with columns for event name, attendance, questions asked, top topic, and photo upload
- **Photo_Upload**: A file input control allowing the organizer to attach an event photo to an event row in the Event Engagement Table
- **Community_Hub**: A shared bulletin board section where all roles can post articles, links, code repositories, and discussion notes
- **Connect_Join_Section**: A section displaying community platform links (Discord, Meetup, GitHub, Slack) as clickable cards
- **Manage_Links_Section**: An organizer-only CRUD form for adding and removing community platform links

## Requirements

### Requirement 1: Remove Region Selector from Header

**User Story:** As a user on any authenticated page, I want the header to be free of decorative mock elements, so that the interface feels purposeful and uncluttered.

#### Acceptance Criteria

1. WHEN an authenticated page is rendered, THE Header SHALL NOT display the Region_Selector element
2. THE Header SHALL retain the application logo, role indicator, sign-out button, and profile avatar

### Requirement 2: Display Top Counters

**User Story:** As an organizer, I want to see a summary of community intelligence metrics at the top of my dashboard, so that I can quickly assess community health.

#### Acceptance Criteria

1. WHEN the Organizer_Dashboard is rendered, THE Top_Counters SHALL display three metrics: gaps detected count, emerging topics count, and community strengths count
2. THE Top_Counters SHALL use semantic coloring to differentiate metric categories: deep orange for gaps, bright orange for emerging topics, and blue for strengths
3. THE Top_Counters SHALL be displayed in a horizontal three-column grid layout

### Requirement 3: Display Community Gaps with Suggested Experts

**User Story:** As an organizer, I want to see detailed gap cards with suggested experts, so that I can plan content and speaker recruitment to address community needs.

#### Acceptance Criteria

1. WHEN the Organizer_Dashboard is rendered, THE Organizer_Dashboard SHALL display Gap_Card components for each detected community knowledge gap
2. EACH Gap_Card SHALL display the topic name, a demand score, a description of the gap, and at least one suggested expert with name and role
3. THE Gap_Card components SHALL be arranged in a responsive grid (two columns on medium screens and above)
4. EACH Gap_Card SHALL use a border color indicating gap status (orange-tinted border)

### Requirement 4: Display Event Engagement Table

**User Story:** As an organizer, I want to view event engagement metrics in a sortable table, so that I can evaluate past event performance and identify high-impact events.

#### Acceptance Criteria

1. WHEN the Organizer_Dashboard is rendered, THE Event_Engagement_Table SHALL display columns for event name, attendance count, questions count, and top topic
2. THE Event_Engagement_Table SHALL support sorting by attendance count and by questions count
3. WHEN the organizer selects a sort option, THE Event_Engagement_Table SHALL reorder rows in descending order by the selected metric

### Requirement 5: Support Event Photo Upload

**User Story:** As an organizer, I want to upload photos for past events, so that I can visually document community gatherings.

#### Acceptance Criteria

1. EACH row in the Event_Engagement_Table SHALL include a Photo_Upload control
2. WHEN the organizer selects a file via Photo_Upload, THE Event_Engagement_Table SHALL display a thumbnail preview of the uploaded image in the corresponding row
3. THE Photo_Upload control SHALL accept image file types only

### Requirement 6: Retain Manage Community Links Section

**User Story:** As an organizer, I want to add and remove community platform links from my dashboard, so that I can curate the resources visible to all community members.

#### Acceptance Criteria

1. WHEN the Organizer_Dashboard is rendered, THE Organizer_Dashboard SHALL display the Manage_Links_Section
2. THE Manage_Links_Section SHALL include a form with inputs for link name, platform type, URL, and brief description
3. WHEN the organizer submits the form with valid inputs, THE Manage_Links_Section SHALL add the new link to the active links list
4. THE Manage_Links_Section SHALL display all active community links with a remove option for each
5. WHEN the organizer clicks remove on a link, THE Manage_Links_Section SHALL remove that link from the active list
6. THE community links managed by the organizer SHALL persist via localStorage

### Requirement 7: Remove Shared Sections from Organizer View

**User Story:** As an organizer, I want a focused dashboard that shows only intelligence and event data, so that the Radar-centric experience remains uncluttered.

#### Acceptance Criteria

1. WHEN the selected role is organizer, THE Organizer_Dashboard SHALL NOT render the Community_Hub section
2. WHEN the selected role is organizer, THE Organizer_Dashboard SHALL NOT render the Connect_Join_Section
3. WHEN the selected role is learner or pro, THE DashboardPage SHALL continue to render the Community_Hub and Connect_Join_Section as before
