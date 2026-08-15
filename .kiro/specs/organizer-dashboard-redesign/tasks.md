# Tasks

## Task 1: Remove Region Selector from Header

- [ ] 1.1 In `src/App.jsx`, remove the region selector div block (containing "N. Virginia" and "us-east-1") from the authenticated header section
- [ ] 1.2 Verify the header still renders the application logo, role indicator, sign-out button, and profile avatar correctly

## Task 2: Conditionally Hide Shared Sections for Organizer Role

- [ ] 2.1 In `src/pages/DashboardPage.jsx`, wrap the "AWS Community Hub" section and the "Connect & Join the AWS Community" section in a conditional that only renders when `selectedRole !== 'organizer'`
- [ ] 2.2 Verify that learner and pro roles still see the Community Hub and Connect & Join sections as before
- [ ] 2.3 Verify the organizer view does NOT show the Community Hub or Connect & Join sections

## Task 3: Verify Organizer Dashboard Final State

- [ ] 3.1 Verify the Organizer dashboard renders: Top Counters (3 metrics), Community Gaps (gap cards with experts), Manage Community Links (add/remove form with active links list), and Event Engagement Table (with sort and photo upload)
- [ ] 3.2 Verify event sorting by attendance and questions still works correctly
- [ ] 3.3 Verify photo upload still attaches a preview thumbnail to the correct event row
- [ ] 3.4 Verify adding a new community link works and appears in the active links list
- [ ] 3.5 Verify removing a community link works
- [ ] 3.6 Verify the application builds without errors after all changes
