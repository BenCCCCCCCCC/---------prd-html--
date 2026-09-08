---
name: netease-product-review
description: Review the NetEase recommendation-control portfolio against its PRD, teacher feedback, scope, data provenance, and AI authority boundaries. Use before implementation and before handback.
---

# NetEase product review

This is a project-authored skill. Read AGENTS.md, docs/PRD_v0.5.1.md, docs/DECISIONS.md, docs/TRADEOFFS_AND_REJECTED_ALTERNATIVES.md, docs/IMPLEMENTATION_CONTRACT.md, specs/product-config.json and data/acceptance_cases.json first.

## Required review

1. Keep R03/R04 core, R05/R06 deferred, R07 independently switchable. Do not build an entire streaming service.
2. Preserve independent axes: recommendation-use frequency is not App usage, duration is not frequency, tenure is not control proficiency, a temporary context is not a permanent persona. There is no empirical cohort size in this project.
3. Session-only preferences must not become long-term just because they are explicit. Only dirty fields are written. Unmentioned AI fields remain unchanged; null and [] are different.
4. Distinguish soft downranking, seeded hard exclusion, and historical event exclusion. Never use the same success copy for all three.
5. Isolation review_required still protects. Excluded playback segments never get backfilled on close, undo, timeout, upload or restart. Split events at state boundaries.
6. Separate settings application from recommendation rendering. Test idempotency, late results, song snapshots and revision-aware undo.
7. AI can propose but cannot execute or choose permissions. No fake confidence. Schema validity is not semantic correctness. No network/model call without explicit authorization.
8. Demo events, synthetic fixtures and actual tests are separate. Keep runStatus=not_run until execution produces evidence. Do not invent metrics, interviews or completed research.
9. For each changed field/state/route, update its acceptance case and documentation. Resolve document conflict explicitly rather than silently choosing a behavior.

## Output

Return one consolidated review: blocking issues first, then repaired issues, test evidence paths, untested risks, and at most a small set of product decisions requiring the owner. Do not ask for approval for every CSS change. Never change privacy scope or publish externally as a routine repair.

## Trade-off review

Check that major decisions show alternatives, selection criteria, one cost, and a validation/reversal condition. Reject any copy that claims a design A/B/C comparison was a completed randomized A/B experiment.
