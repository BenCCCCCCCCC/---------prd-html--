---
name: netease-build-verify
description: Build and verify the NetEase recommendation-control portfolio Beta with mechanical gates, browser-driven checks, screenshots, and truthful handoff.
---

# NetEase Build & Verify Skill

Use for any implementation batch in this repository.

## Before coding

1. Read `AGENTS.md` and the referenced contracts/specs.
2. Write a short build plan with environment, architecture, commands and blockers.
3. Never substitute page-component constants for spec/config values.
4. Do not ask for micro-decisions that can be resolved conservatively.

## Required loop

For each substantial feature:

1. Implement the smallest coherent vertical slice.
2. Run type/lint/unit checks for the affected area.
3. Launch the application and operate it through the browser.
4. Inspect DOM, console, state and user-visible copy.
5. Capture the affected required screenshots.
6. Review screenshots using the visual QA skill.
7. Fix defects, then rerun checks and screenshots.

A compile or passing unit test does not prove the UI or user flow works.

## Mechanical invariants

Fail the build when possible if:

- generated types drift from canonical JSON Schema;
- product config/tokens are bypassed by duplicate constants;
- real-provider network calls or browser API keys are introduced;
- required synthetic fixtures are skipped or marked passed without execution;
- core routes fail to load offline after initial build;
- critical flows contain console errors, unreachable actions or stale-state overwrite;
- screenshots are missing for required states.

## Severity

- P0: wrong product meaning, unauthorized AI action, data/secret exposure, dead core flow.
- P1: wrong scope/undo/protection state, inaccessible core action, overlap/cutoff, misleading result.
- P2: polish, minor spacing, non-blocking copy or secondary responsive issue.

No P0/P1 may remain at handoff. Record P2 and fix obvious ones before handoff.

## Truthful handoff

Only write PASS for commands actually run. Distinguish:

- PASS
- FAIL
- NOT_RUN
- BLOCKED_ENVIRONMENT
- MANUAL_REVIEW_REQUIRED

List exact paths for logs/screenshots and state whether Git commit, remote or deployment happened.

## Portfolio decision gate

Run AC31–AC34 and capture quick/deep decision sections at 320x740, 390x844 and 1440x900. Verify that design alternatives are not labelled as a completed randomized A/B experiment.
