# Testing Practices

## Current State
Currently, Acadence relies heavily on manual testing and Next.js development server tooling. There is no large-scale automated test suite explicitly defined in the `package.json`.

## Recommended Framework
- **Unit Testing**: Jest or Vitest for testing pure utility functions and business logic inside `lib/attendance` and `lib/engines`.
- **Component Testing**: React Testing Library for verifying `components/` UI states.
- **End-to-End (E2E)**: Playwright or Cypress for core user flows:
  - Login/Registration
  - Marking daily attendance
  - Modifying semester configurations.

## Database Testing
- The Supabase development environment (`supabase/` folder) should be used for integration testing. You can reset the database and run seed data to maintain a predictable testing environment.

## Coverage
- Test coverage metrics are currently not tracked. Future implementations should target critical data engines and authentication paths first.
