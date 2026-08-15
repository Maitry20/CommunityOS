---
inclusion: always
---

# CommunityOS — Development Standards

## Code Quality

- Use clean, maintainable, production-oriented code
- TypeScript for frontend code (migrate incrementally from current JSX)
- Python for backend code
- Clear naming conventions
- Small, focused modules
- Reusable components
- Proper error handling
- Input validation
- Logging for important backend operations
- No hard-coded credentials
- Environment variables for configuration
- Keep API contracts explicit
- Document non-obvious architectural decisions

## Frontend Conventions (Current)

### File Structure
```
src/
  main.jsx          — App entry point (BrowserRouter wrapper)
  App.jsx           — Root component, global state, layout
  App.css           — Reserved (currently empty)
  index.css         — Tailwind imports, theme tokens, global styles
  mockData.js       — Seed data for development
  pages/
    LoginPage.jsx   — Role selection + sign-in
    SetupPage.jsx   — Profile creation form
    DashboardPage.jsx — Role-based dashboard views
  assets/           — Static images
public/
  favicon.svg
  icons.svg
```

### Styling Patterns
- Tailwind utility classes exclusively (no custom CSS except scrollbar/transitions)
- AWS dark theme color tokens defined in `@theme` block in index.css
- Component patterns: `bg-[#161b24] border border-[#353f4d] p-5 rounded-sm`
- Labels: `text-[10px] font-mono text-neutral-400 uppercase tracking-wider`
- Buttons: `font-mono text-xs uppercase tracking-wider` with border + hover states
- Inputs: `bg-[#0f141c] border border-[#353f4d] focus:border-[#ff9900] rounded-sm`

### State Management
- Currently all state in App.jsx via useState hooks
- localStorage for persistence (users, contributions, community links)
- Props drilling to page components
- No external state library yet

### Routing
- React Router DOM 7
- Routes: `/` (login), `/setup` (profile), `/dashboard` (main)
- Route guard: redirect to `/` if no selectedRole

## Testing Principles

Every major feature should have appropriate tests. Prioritize testing:

1. Data ingestion
2. Schema validation
3. API endpoints
4. AI pipeline transformations
5. Radar scoring logic
6. Knowledge-gap detection
7. Recommendation logic
8. Authentication/authorization
9. Error handling

Do not consider a feature complete merely because the code compiles.

## Security Principles

Never commit:
- AWS access keys
- API keys
- Passwords
- Tokens
- Private credentials
- Secrets

Use AWS IAM, Secrets Manager, environment variables, and least-privilege permissions.
Validate all user-provided input.
Do not expose internal AWS credentials or sensitive community data through APIs.

## Build & Tooling

- `npm run dev` — Vite dev server with HMR
- `npm run build` — Production build
- `npm run lint` — OxLint (React plugin + rules-of-hooks)
- `npm run preview` — Preview production build locally

## When Modifying Existing Code

1. Understand the current architecture before introducing changes
2. Do not rewrite working components unnecessarily
3. Follow existing patterns (color tokens, component structure, naming)
4. Preserve existing functionality unless the feature requires a change
5. Test that existing flows still work after modifications
