---
name: netease-visual-qa
description: Implement and review the specific visual language of the NetEase recommendation-control portfolio using the provided tokens, original reference, responsive layouts, and screenshot gates. Use for UI implementation, styling, and visual handback.
---

# NetEase visual QA

This is a project-authored skill, not a vendor plugin. Read docs/HTML_SPEC.md, specs/design-tokens.json and design/FRAME_MAPPING.md.

## Design intent

The portfolio's job is to explain and demonstrate control of music recommendations. Keep the existing record-centered player hierarchy and dark bottom sheet. A neutral case-study shell supports the demo; it must not resemble an unrelated analytics dashboard or a generic AI landing page.

## Implementation constraints

- Use the supplied tokens, not ad-hoc CSS values. White button text uses #D92D3A, not an unverified brighter red. A token contrast check is necessary but actual rendered states still require inspection.
- Chinese body copy is 16px with readable line-height, helpers 14px. Do not force long text into 12px to preserve a screenshot's coordinates.
- Bottom sheets are responsive and content-aware; never fix every viewport at y=400. Keep a visible close/back path, scrollable content, and reachable actions when a keyboard is open.
- 44px minimum key targets are a project choice. Preserve semantic buttons, radios, switches and explicit state; color alone is insufficient.
- Do not scale a 390px phone screenshot down to make a 320px layout. Reflow instead. On mobile do not wrap the app in a second device shell.
- Use only purposeful transitions, honor reduced motion. No unrequested gradients, glowing orbs, glassmorphism, autoplay videos, decorative charts or fake metrics.
- Old reference screenshots are not executable UI, and their empty gray overlay is not the app background. Render the underlying player as DOM.
- The public catalog and covers are fictional. Do not quietly copy copyrighted album artwork into production assets.

## Screenshot gate

After the entire batch, use stable catalog seed, clock and state. Capture 320x740, 390x844, 768x1024 and 1440x900 for all core states. Inspect screenshots, not only code or build output. Check case hero, normal player/list, root sheet, selected tags, four impact combinations, temporary reminder, refresh failure, AI clarification, keyboard focus, and long Chinese text.

Blocking: overlap, cut text, hidden action, unreadable contrast, wrong hierarchy, horizontal overflow, unreachable back/close, ambiguous protection state. Fix before handback. Provide before/after for repaired issues and list intentional differences from v0.4. Never claim pixel-perfect or accessible based only on a successful build.

## Decision comparison UI

At 320px and 390px, never compress A/B/C into a tiny horizontal table. Use stacked cards or disclosure. Selected, rejected and deferred states must be distinguishable by label and hierarchy, not color alone. The chosen option must also show one trade-off so the section does not read like marketing copy.
