import { expect, it } from "vitest";
import { advance, apply, config, initial, openDraft, undo } from "./model";
it("new protection starts its idle window at application, even after previous long pause", () => {
  let s = advance(initial(100000000), 3600000);
  const d = openDraft(s);
  d.protection = true;
  s = apply(s, d).state;
  expect(advance(s, 1000).protection).toBe("active");
  expect(advance(s, config.session.idleMinutes * 60000).protection).toBe(
    "review_required",
  );
});
it("undo closing review-required restores pending review and original reminder cycle", () => {
  let s = initial(100000000);
  let d = openDraft(s);
  d.protection = true;
  s = advance(apply(s, d).state, config.session.maxHours * 3600000);
  const original = s.protectionStarted;
  d = openDraft(s);
  d.protection = false;
  s = apply(s, d).state;
  const restored = undo(s, d.operationId);
  expect(restored.error).toBeNull();
  expect(restored.state.protection).toBe("review_required");
  expect(restored.state.protectionStarted).toBe(original);
});
