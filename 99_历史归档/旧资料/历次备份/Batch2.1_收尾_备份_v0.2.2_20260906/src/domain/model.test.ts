import { describe, expect, it } from "vitest";
import fixtures from "../../data/ranking_fixtures.json";
import invalid from "../../data/invalid_output_fixtures.json";
import evalText from "../../data/ai_eval_cases.jsonl?raw";
import {
  adopt,
  candidateValid,
  currentEnvelope,
  LocalRuleAdapter,
  parse,
  RealProviderAdapter,
  schemaValid,
  type IntentCandidate,
  type IntentRequest,
} from "./ai";
import {
  advance,
  apply,
  catalog,
  clone,
  config,
  dirty,
  effective,
  initial,
  openDraft,
  playback,
  rank,
  refresh,
  removeSaved,
  undo,
  type Draft,
  type Preference,
  type State,
} from "./model";
import { resetStorage, restore, save } from "../storage";
const setup = () => initial(100000000);
const edited = (s = setup()): Draft => {
  const d = openDraft(s);
  d.value.freshness = "explore";
  d.value.positiveTagIds = ["genre_folk"];
  return d;
};
const applied = (s = setup(), d = edited(s)) => {
  const r = apply(s, d);
  expect(r.error).toBeNull();
  return r.state;
};
const protectedState = () => {
  const s = setup(),
    d = edited(s);
  d.protection = true;
  return applied(s, d);
};
describe("canonical ranking fixtures", () => {
  for (const f of fixtures)
    it(f.id, () => {
      const actual = rank(f.input as Preference);
      expect(
        actual.slice(0, config.ranking.listLength).map((t) => t.id),
      ).toEqual(f.expectedTop8);
      for (const score of f.expectedScores) {
        const t = actual.find((t) => t.id === score.trackId)!;
        expect(t.score).toBeCloseTo(score.score, 5);
        expect(t.positiveMatch).toBeCloseTo(score.positiveMatch, 5);
        expect(t.negativeMatch).toBe(score.negativeMatch);
      }
    });
});
describe("AI synthetic regression (not independent model evaluation)", () => {
  for (const row of evalText.trim().split("\n")) {
    const f = JSON.parse(row);
    it(f.id + " " + f.category, () => {
      if (f.expectedInputGate === "reject") {
        expect(() => parse(f.request)).toThrow();
        return;
      }
      const c = parse(f.request),
        e = f.expectedCandidate;
      expect(schemaValid(c)).toBe(true);
      expect(candidateValid(c)).toBe(true);
      expect(c.status).toBe(e.status);
      expect(c.patch.freshness).toEqual(e.patch.freshness);
      expect(c.patch.positiveTagIds?.slice().sort() ?? null).toEqual(
        e.patch.positiveTagIds?.slice().sort() ?? null,
      );
      expect(c.patch.negativeTargets).toEqual(e.patch.negativeTargets);
      expect(c.scopeSuggestion).toBe(e.scopeSuggestion);
      expect(c.isolationSuggestion).toBe(e.isolationSuggestion);
      if (c.status !== "ready") {
        expect(c.clarificationQuestion?.length).toBeGreaterThan(4);
        expect(c.unmappedPhrases.length).toBeGreaterThan(0);
      } else expect(c.unmappedPhrases).toEqual([]);
    });
  }
});
describe("invalid output layers", () => {
  for (const f of invalid)
    it(f.id, () => {
      expect(schemaValid(f.candidate)).toBe(f.schemaShouldPass);
      if ("domainShouldPass" in f)
        expect(candidateValid(f.candidate)).toBe(f.domainShouldPass);
    });
});
describe("acceptance domain behaviors", () => {
  it("AC01 initial no dirty fields default session", () => {
    const s = setup(),
      d = openDraft(s);
    expect(d.value).toEqual(catalog.initialPersistentPreference);
    expect(d.scope).toBe("session");
    expect(dirty(d, s)).toEqual([]);
    d.scope = "long_term";
    expect(dirty(d, s)).toEqual([]);
  });
  it("AC02 draft is detached and return retains values", () => {
    const s = setup(),
      d = edited(s);
    expect(d.value.positiveTagIds).toEqual(["genre_folk"]);
    expect(effective(s).positiveTagIds).toEqual([]);
    expect(openDraft(s).value.freshness).toBe("balanced");
  });
  it("AC05 session writes leave persistent state intact", () => {
    const s = applied();
    expect(s.persistent).toEqual(catalog.initialPersistentPreference);
    expect(s.session.freshness).toBe("explore");
  });
  it("AC06 long term diff promotion explicit, clears only corresponding override; independent removal", () => {
    let s = applied();
    let d = openDraft(s);
    d.scope = "long_term";
    expect(dirty(d, s)).toEqual([]);
    d.promote = true;
    s = applied(s, d);
    expect(s.persistent.positiveTagIds).toEqual(["genre_folk"]);
    expect(s.session.positiveTagIds).toBeNull();
    d = openDraft(s);
    expect(d.scope).toBe("session");
    s = removeSaved(s, "positiveTagIds", "genre_folk");
    expect(s.persistent.positiveTagIds).toEqual([]);
    expect(catalog.seededTrackBlacklist).toEqual(["T04"]);
  });
  it("AC07 unmentioned tags and AI null are retained", () => {
    let s = setup();
    s.persistent.positiveTagIds = ["genre_folk"];
    const d = openDraft(s);
    d.value.freshness = "explore";
    s = applied(s, d);
    expect(s.session.positiveTagIds).toBeNull();
    expect(effective(s).positiveTagIds).toEqual(["genre_folk"]);
  });
  it("AC08 conflict includes old persistent negative and does not delete it", () => {
    const s = setup();
    s.persistent.negativeTargets = [{ kind: "tag", id: "genre_folk" }];
    const r = apply(s, edited(s));
    expect(r.error).toContain("同一标签");
    expect(r.state.persistent.negativeTargets).toEqual(
      s.persistent.negativeTargets,
    );
  });
  it("AC09 hard blacklist survives exploration; soft negatives penalize once", () => {
    const s = applied();
    s.session.negativeTargets = [
      { kind: "artist", id: "A01" },
      { kind: "track", id: "T01" },
    ];
    const r = rank(effective(s));
    expect(r.some((t) => t.id === "T04" || t.artistId === "A08")).toBe(false);
    expect(r.find((t) => t.id === "T01")?.negativeMatch).toBe(1);
  });
  for (const [id, scope, on] of [
    ["AC10", "session", false],
    ["AC11", "session", true],
    ["AC12", "long_term", true],
    ["AC12-combination4", "long_term", false],
  ] as const)
    it(id + " scope/isolation orthogonal", () => {
      const s = setup(),
        d = edited(s);
      d.scope = scope;
      d.protection = on;
      let n = playback(applied(s, d), "toggle");
      n = advance(n, 10000);
      n = playback(n, "toggle");
      expect(
        n.logs.find((e) => e.name === "playback_segment")?.longTermEligible,
      ).toBe(!on);
      expect(n.persistent.freshness).toBe(
        scope === "session" ? "balanced" : "explore",
      );
    });
  it("AC13 explicit likes and playlist remain under protection", () => {
    let s = protectedState();
    s = playback(playback(s, "heart"), "playlist");
    expect(s.likes).toContain(s.trackId);
    expect(s.playlist).toContain(s.trackId);
  });
  it("AC14 all controlled origins protect, unknown is conservative", () => {
    for (const source of [
      "recommendation",
      "playlist",
      "search",
      "unknown",
    ] as const) {
      let s = protectedState();
      s.source = source;
      s = playback(s, "toggle");
      expect(s.logs.at(-1)?.longTermEligible).toBe(false);
      expect(s.logs.at(-1)?.queueOrigin).toBe(source);
    }
  });
  it("AC15 idle ends R03 while R04 keeps protecting", () => {
    const s = advance(protectedState(), config.session.idleMinutes * 60000);
    expect(s.session.freshness).toBeNull();
    expect(s.protection).toBe("review_required");
  });
  it("AC16 continuous playback max cap; edits never extend start", () => {
    let s = playback(protectedState(), "toggle");
    const start = s.sessionStarted;
    const d = openDraft(s);
    d.value.freshness = "familiar";
    s = applied(s, d);
    expect(s.sessionStarted).toBe(start);
    s = advance(s, config.session.maxHours * 3600000);
    expect(s.protection).toBe("review_required");
    expect(s.session.freshness).toBeNull();
    s.protection = "active";
    s.protectionStarted = s.now;
    s.lastListening = s.now;
    expect(playback(s, "next").logs.at(-1)?.longTermEligible).toBe(false);
  });
  it("AC17 disjoint half-open playback segments never backfill", () => {
    let s = playback(setup(), "toggle");
    s = advance(s, 1000);
    let d = openDraft(s);
    d.protection = true;
    s = applied(s, d);
    s = advance(s, 2000);
    d = openDraft(s);
    d.protection = false;
    s = applied(s, d);
    s = advance(s, 1000);
    s = playback(s, "toggle");
    const logs = s.logs.filter((e) => e.name === "playback_segment");
    expect(logs.map((e) => e.longTermEligible)).toEqual([true, false, true]);
    expect(logs[0].endAt).toBe(logs[1].startAt);
    expect(logs[1].endAt).toBe(logs[2].startAt);
    expect(logs.map((e) => e.playedSeconds)).toEqual([1, 2, 1]);
  });
  it("AC18 double submit uses same operation id exactly once", () => {
    const s = setup(),
      d = edited(s);
    const a = applied(s, d),
      b = applied(a, d);
    expect(b.revision).toBe(1);
    expect(b.operations).toHaveLength(1);
    expect(b.sessionStarted).toBe(a.sessionStarted);
  });
  it("AC19 save failure retry, refresh failure preserves confirmed protection", () => {
    const s = setup(),
      d = edited(s);
    d.protection = true;
    const failed = apply(s, d, true);
    expect(failed.state.revision).toBe(0);
    const saved = applied(failed.state, d);
    const r = refresh(saved, saved.requestId, saved.revision, true);
    expect(r.protection).toBe("active");
    expect(r.refreshStatus).toBe("failed");
    expect(refresh(r).refreshStatus).toBe("ready");
    expect(applied(r, d).revision).toBe(1);
  });
  it("AC20 late request / same revision wrong request cannot overwrite queue", () => {
    let s = applied();
    const id = s.requestId,
      rev = s.revision,
      d = openDraft(s);
    d.value.freshness = "familiar";
    s = refresh(applied(s, d));
    const q = clone(s.queue);
    expect(refresh(s, id, rev).queue).toEqual(q);
    expect(refresh(s, "other", s.revision).queue).toEqual(q);
  });
  it("AC21 inverse patch preserves likes/playback and rejects subsequent related mutation", () => {
    let s = applied();
    const id = s.operations[0].operationId;
    s = playback(playback(s, "heart"), "toggle");
    const result = undo(s, id);
    expect(result.error).toBeNull();
    expect(result.state.likes).toEqual(s.likes);
    expect(result.state.playing).toBe(true);
    expect(result.state.session.freshness).toBeNull();
    const d = openDraft(s);
    d.value.freshness = "familiar";
    s = applied(s, d);
    expect(undo(s, id).error).toBeTruthy();
  });
  it("AC22 target is opening track snapshot", () => {
    let s = setup();
    const d = openDraft(s);
    s = playback(s, "next");
    d.negativePatch = [{ kind: "track", id: d.track.id }];
    s = applied(s, d);
    expect(s.trackId).toBe("T02");
    expect(s.session.negativeTargets[0].id).toBe("T01");
  });
  it("AC23 empty pool retains playback and hard constraints", () => {
    const s = applied();
    const n = refresh(s, s.requestId, s.revision, false, []);
    expect(n.queue).toEqual([]);
    expect(n.trackId).toBe(s.trackId);
  });
  it("AC24 adopt edits only draft; null vs empty remains distinct", () => {
    const s = applied(),
      d = openDraft(s);
    const c = parse({
      requestId: "x",
      draftRevision: 0,
      inputText: "新鲜程度调回平衡",
      currentTrackId: null,
      currentArtistId: null,
      currentStyleIds: [],
    });
    const n = adopt(d, c);
    expect(n.value.positiveTagIds).toEqual(["genre_folk"]);
    expect(s.session.freshness).toBe("explore");
    c.patch.positiveTagIds = [];
    expect(adopt(d, c).value.positiveTagIds).toEqual([]);
  });
  it("AC25 permissions remain suggestions; real adapter disabled", async () => {
    const r: IntentRequest = {
      requestId: "x",
      draftRevision: 0,
      inputText: "以后少推当前音乐人",
      currentTrackId: "T01",
      currentArtistId: "A01",
      currentStyleIds: ["genre_folk"],
    };
    const c = parse(r),
      d = adopt(openDraft(setup()), c);
    expect(d.scope).toBe("session");
    expect(d.protection).toBe(false);
    expect((await new RealProviderAdapter().parse(r)).errorCode).toBe(
      "REAL_PROVIDER_DISABLED",
    );
  });
  it("AC26 cancelled and stale parse cannot adopt", async () => {
    const r: IntentRequest = {
      requestId: "x",
      draftRevision: 0,
      inputText: "想听民谣",
      currentTrackId: null,
      currentArtistId: null,
      currentStyleIds: [],
    };
    const a = new AbortController();
    a.abort();
    const e = await new LocalRuleAdapter().parse(r, a.signal);
    expect(e.transportStatus).toBe("cancelled");
    expect(currentEnvelope(e, "x", 0)).toBe(false);
    expect(currentEnvelope({ ...e, transportStatus: "ok" }, "x", 1)).toBe(
      false,
    );
  });
  it("AC27 storage restoration and namespace reset leave unrelated keys", () => {
    sessionStorage.clear();
    sessionStorage.setItem("unrelated", "keep");
    save(sessionStorage, protectedState());
    expect(restore(sessionStorage, 100000000).protection).toBe("active");
    resetStorage(sessionStorage);
    expect(sessionStorage.getItem("unrelated")).toBe("keep");
    expect(sessionStorage.getItem(config.browserDemo.namespace)).toBeNull();
  });
  it("AC30 R07 flag off keeps manual execution independent", () => {
    const s = setup();
    s.aiEnabled = false;
    expect(applied(s, edited(s)).session.freshness).toBe("explore");
  });
  it("negative empty clears only target bucket, union remains; promoted additions de-duplicate", () => {
    let s = setup();
    s.persistent.negativeTargets = [{ kind: "artist", id: "A01" }];
    s.session.negativeTargets = [{ kind: "track", id: "T02" }];
    const d = openDraft(s);
    d.negativePatch = [];
    s = applied(s, d);
    expect(s.session.negativeTargets).toEqual([]);
    expect(effective(s).negativeTargets).toHaveLength(1);
  });
  it("unrelated undo cannot introduce cross-field positive/negative conflict", () => {
    let s = setup();
    s.session.positiveTagIds = ["genre_folk"];
    let d = openDraft(s);
    d.value.positiveTagIds = [];
    s = applied(s, d);
    const id = s.operations[0].operationId;
    d = openDraft(s);
    d.negativePatch = [{ kind: "tag", id: "genre_folk" }];
    s = applied(s, d);
    expect(undo(s, id).error).toContain("同一标签");
  });
  it("no-op ready candidate rejected; unknown context is not guessed", () => {
    const c: IntentCandidate = {
      status: "ready",
      patch: { freshness: null, positiveTagIds: null, negativeTargets: null },
      scopeSuggestion: null,
      isolationSuggestion: null,
      unmappedPhrases: [],
      clarificationQuestion: null,
    };
    expect(candidateValid(c)).toBe(false);
    expect(
      parse({
        requestId: "x",
        draftRevision: 0,
        inputText: "少推这个歌手",
        currentTrackId: null,
        currentArtistId: null,
        currentStyleIds: [],
      }).status,
    ).toBe("needs_clarification");
  });
  it("schema handles Unicode code points rather than UTF16 length", () => {
    const r: IntentRequest = {
      requestId: "u",
      draftRevision: 0,
      inputText: "🎵".repeat(200),
      currentTrackId: null,
      currentArtistId: null,
      currentStyleIds: [],
    };
    expect(() => parse(r)).not.toThrow();
    expect(() => parse({ ...r, inputText: r.inputText + "🎵" })).toThrow();
  });
  it("save concurrency checks preserve draft and reject last-write-wins", () => {
    const s = setup(),
      d = edited(s);
    s.revision = 2;
    expect(apply(s, d).error).toContain("版本冲突");
    expect(d.value.freshness).toBe("explore");
  });
  it("same-tab restoration expires old overrides while keeping protection", () => {
    const s: State = protectedState();
    save(sessionStorage, s);
    const restored = restore(
      sessionStorage,
      s.now + config.session.maxHours * 3600000,
    );
    expect(restored.protection).toBe("review_required");
    expect(restored.session.freshness).toBeNull();
  });
});
