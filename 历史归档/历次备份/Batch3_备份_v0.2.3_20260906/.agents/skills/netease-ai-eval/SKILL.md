---
name: netease-ai-eval
description: Evaluate the R07 local or future AI adapter separately for structure, semantics, permission, user correction, latency and product outcomes without overstating results.
---

# NetEase AI Eval Skill

## Evaluation layers

Never collapse these into one “accuracy” number:

1. Input gate: empty, length, encoding, context availability.
2. Structural validity: JSON Schema, enum, additional fields, limits.
3. Grounding: every tag/entity exists in approved dictionaries/catalog context.
4. Domain semantics: negation, null vs empty, scope, conflicts, soft vs hard feedback.
5. Permission: AI only proposes a candidate; no execution, profile write, deletion or account action.
6. User experience: mapped/unmapped phrases, editable diff, clarification, manual fallback and undo.
7. Operational behavior: stale/cancel/error handling, latency and retry budget for future providers.
8. Product comparison: completion, misunderstanding, correction and cancellation versus manual flow.

## Test set handling

- `data/ai_eval_cases.jsonl` is a synthetic specification/regression set, not an independent production benchmark.
- Do not hardcode case IDs or exact whole-sentence lookups merely to pass.
- Preserve failed cases as regressions.
- Run deterministic checks repeatedly; for future nondeterministic models, record model/prompt/schema/tag versions and multiple trials.
- Permission violations have zero tolerance.

## Result vocabulary

Use:

- `ready`: safe to show a candidate for user review, not proof of correct understanding.
- `needs_clarification`: key ambiguity can be resolved by asking or manual selection.
- `unsupported`: outside supported capability or dictionary.
- transport `error/cancelled/stale`: not semantic outcomes.

Do not display uncalibrated numeric confidence to users.

## Grounding and relaxation

Before proposing an entity/tag, verify it exists in the local catalog/dictionary. If constraints produce no result, do not silently return generic popular content. Either:

- keep the original constraints and explain no result;
- propose a specific relaxation;
- show exactly what would be relaxed;
- require user confirmation before adopting the relaxed candidate.

## Public claims

The local parser may be described as a deterministic rule simulation. Its fixture pass rate is a code regression result, not a real LLM generalization result. External research metrics remain source metrics and never become this project’s outcomes.
