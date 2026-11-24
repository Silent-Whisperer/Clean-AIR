---
name: ui-roaster
description: Workflow for roasting frontend designs, generating visual upgrade blueprints, and implementing pixel-perfect React/Tailwind fixes.
---

# UI Roaster & Fixer Workflow

This skill teaches the agent how to systematically critique frontend designs and immediately execute visual upgrades.

## Step 1: Component & DOM Inspection
1. Read the target component file in `src/components/`.
2. Inspect the HTML hierarchy, Tailwind classes, typography scales, accessibility tags, and state hooks.
3. Identify visual bottlenecks:
   - Clunky borders (`border-stone-300` vs subtle `border-stone-200/80`)
   - Monotonous layouts (all cards look identical)
   - Weak primary CTA prominence
   - Missing keyboard accessibility or focus rings

## Step 2: Deliver The Roast
Provide an unfiltered, witty, yet constructive review:
- **The Verdict**: A 1-2 sentence candid summary of what's wrong.
- **The Scorecard**: 5-Axis rating out of 10.
- **The Gaps**: Bulleted list of exact UI sins (e.g. "Card padding is choking the PM2.5 metric", "The modal has zero focus trapping").

## Step 3: Implement The Elevation
1. Propose the improved design aesthetic.
2. Use `edit_file` or `write_file` to refactor the component.
3. Enforce the `<300 lines` constraint by decomposing subcomponents if necessary.
4. Verify by running `npm test` and `npm run build`.
