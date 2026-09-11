# Design Document

## Overview

This design covers the Organizer Dashboard redesign that removes decorative UI elements and hides shared bulletin sections to focus the Organizer view on Radar-centric community intelligence. The Manage Community Links section is retained as it provides organizers with the ability to curate platform links. Changes are scoped to two files: `App.jsx` (header region selector removal) and `DashboardPage.jsx` (conditional rendering of shared sections for the organizer role).

## Architecture

### Current State

- `App.jsx` header contains a decorative "N. Virginia us-east-1" region selector element shown on all authenticated pages
- `DashboardPage.jsx` Organizer section contains: Top Counters, Community Gaps, Manage Community Links (CRUD form), Event Engagement Table with photo upload
- Below all role dashboards, shared sections render unconditionally: AWS Community Hub (bulletin board) and Connect & Join (community links cards)

### Target State

- `App.jsx` header: Region selector element removed entirely
- `DashboardPage.jsx` Organizer section contains: Top Counters, Community Gaps (gap cards with experts), Manage Community Links (CRUD form retained), Event Engagement Table with photo upload
- Shared sections (Community Hub, Connect & Join) render conditionally — shown for learner and pro roles, hidden for organizer role

### Design Decisions

1. **Conditional rendering over route separation**: Rather than splitting the organizer into a separate page component, use conditional rendering (`selectedRole !== 'organizer'`) to hide shared sections. This preserves the existing single-page architecture and minimizes code churn.

2. **Complete removal of region selector**: The region selector is purely decorative with no functional purpose. Removing the entire div block is the cleanest approach.

3. **Manage Community Links retained**: The `communityLinks` state, `setCommunityLinks` prop, and related handler functions (`handleAddLinkSubmit`, `handleRemoveLink`) remain in place. The Manage Links section stays in the organizer dashboard since organizers need the ability to curate community platform links.

4. **No new components created**: The existing inline JSX structure is retained since the changes are subtractive (removing shared sections for organizer) rather than additive.

## Components Affected

| File | Change Type | Description |
|------|------------|-------------|
| `src/App.jsx` | Modify | Remove the region selector div from the header |
| `src/pages/DashboardPage.jsx` | Modify | Wrap shared sections (Community Hub, Connect & Join) in conditional render for non-organizer roles; retain Manage Community Links |

## Correctness Properties

### Property 1: Header retains functional elements after region selector removal
- Given the header is rendered on an authenticated page
- The application logo, role indicator, sign-out button, and profile avatar are all present
- The region selector element (containing "N. Virginia" and "us-east-1" text) is absent

### Property 2: Organizer dashboard renders only approved sections
- Given the selected role is "organizer"
- The Top Counters section (gaps detected, emerging topics, community strengths) is visible
- The Community Gaps section with gap cards is visible
- The Manage Community Links section with add/remove form is visible
- The Event Engagement Table with photo upload is visible
- The Community Hub section is NOT visible
- The Connect & Join section is NOT visible

### Property 3: Learner and Pro dashboards retain shared sections
- Given the selected role is "learner" or "pro"
- The Community Hub section IS visible
- The Connect & Join section IS visible

### Property 4: Event engagement sorting maintains correctness
- For any set of events, sorting by attendance produces rows in strictly descending attendance order
- For any set of events, sorting by questions produces rows in strictly descending questions order

### Property 5: Photo upload functionality preserved
- Each event row in the table contains exactly one file upload input accepting image types
- After a file is selected, a thumbnail preview element is rendered in the corresponding row

## File Changes Detail

### App.jsx — Header Modification

Remove the following block from the authenticated header section:
```jsx
{/* Region Selector */}
<div className="flex items-center space-x-1.5 text-xs text-neutral-300 font-mono bg-[#2b3947] border border-[#415164] px-2.5 py-1 rounded-sm cursor-pointer hover:border-[#ff9900]">
  <span className="w-1.5 h-1.5 bg-[#0972d3] rounded-full animate-pulse"></span>
  <span>N. Virginia</span>
  <span className="text-[9px] text-[#ff9900] font-bold">us-east-1</span>
</div>
```

### DashboardPage.jsx — Organizer Section

The Manage Community Links section is retained as-is. No changes to this section.

### DashboardPage.jsx — Shared Sections Conditional Rendering

Wrap the "AWS Community Hub" and "Connect & Join" sections in a conditional:
```jsx
{selectedRole !== 'organizer' && (
  <>
    {/* AWS Community Board & Share Center */}
    ...
    {/* Join the Community Cards Section */}
    ...
  </>
)}
```
