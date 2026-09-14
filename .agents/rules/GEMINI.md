# Code Review Preferences

## Component Structure
- Proactively suggest extracting JSX blocks into a separate component when they are large, reusable, or have a distinct responsibility.
- Suggest custom hooks (`useXxx`) when `useEffect`/`useState` logic grows large or can be reused across components.
- Flag when a single file is getting too long and recommend how to split it.

## State Management
- Flag redundant state that can be derived/calculated from existing state instead of stored separately.
- Point out stale closure risks in `useEffect` and suggest functional state updates `(prev) => ...` where appropriate.
- Suggest the correct dependency array for `useEffect` hooks.

## Functions & Naming
- Use `const handleXxx = () => {}` arrow functions for event handlers and callbacks defined inside a component body.
- Use `function ComponentName()` declarations for top-level named React components.
- Point out when a variable, function, or component name is unclear and suggest a more descriptive alternative.

## Code Cleanliness
- Flag repeated inline Tailwind class strings that could be extracted into a shared constant or component.
- Suggest moving hardcoded data/constants out of component files and into a dedicated `constants.js` or similar module.
- Recommend prop-drilling alternatives (e.g., context, component composition) when props are passed through more than two layers unnecessarily.

## Git & Verification Rules
- **No Automatic Commits**: NEVER execute `git commit` on behalf of the user. Always display the modified files, verify that checks pass, and provide a clear commit message so the user can review changes and commit manually.
- **Pre-commit Verification**: ALWAYS ensure `npm run lint` (in `frontend/`) passes before making a commit (`git commit`).
- **Pre-push Verification**: ALWAYS ensure `npm run test:run` and `npm run build` (in `frontend/`) pass before pushing to remote (`git push`).
- Never commit if there are any lint errors.
- Never push if there are any failing tests or broken builds.
- Always fix errors before committing or pushing.

## Industry Standards & Product-Company Engineering Practices
- **Single Responsibility & Layered Architecture**: Strictly decouple presentation (UI components), business logic (custom hooks/services), and domain configuration (constants/schemas). Each module must have one reason to change.
- **Function Isolation & Pure Utilities**: Extract standalone, calculation, or deterministic logic (such as formatters, key builders, and code resolvers) out of components and constants into dedicated, pure modules under `utils/` with unit test coverage.
- **Component Boundary & Fault Isolation**: Proactively isolate distinct UI or interaction blocks into their own focused components. If a UI block has its own state/responsibility, can fail independently, or might be reused elsewhere, isolate it to contain regressions and simplify debugging.
- **Defensive Programming & Resilience**: Always guard against `null`/`undefined`, handle boundary conditions, provide graceful fallbacks, and never fail silently. Handle loading, empty, error, and timeout states explicitly.
- **Maintainability & Self-Documenting Code**: Use descriptive, domain-aligned names (avoid ambiguous abbreviations). Keep functions small, modular, and focused. Prefer pure functions and immutable state updates.
- **Accessibility (a11y) First**: Adhere to WCAG 2.1 AA standards — semantic HTML elements, comprehensive ARIA attributes, keyboard navigability, and visible focus management.
- **Behavior-Driven Testing**: Write tests that verify user-facing behavior rather than implementation details (using `@testing-library` accessible queries like `getByRole` and `getByLabelText`), ensuring high confidence in refactoring.
- **Performance & State Colocation**: Colocate state to where it is needed to minimize re-render cascades. Derive state rather than duplicating it. Memoize expensive operations where warranted.
- **Lazy Initialization & On-Demand Loading**: Prefer sparse maps, lazy initialization (`useState({})`), and on-demand derivation over eager $O(N \times M)$ pre-computation at mount time. Never pre-populate or compute heavy data structures for views, questions, or tabs the user has not visited yet.

## Learning & Pair Programming Notes
- Whenever introducing or applying a new React hook, web API, architectural pattern, or engineering concept, proactively include a beginner-friendly explanation covering:
  1. What it is and the mental model behind it.
  2. Why it was chosen over alternatives (e.g., `useRef` vs `useState`).
  3. How it works in our specific feature.


