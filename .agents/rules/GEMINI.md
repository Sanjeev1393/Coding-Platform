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
