import config from "../../specs/product-config.json";
import catalog from "../../data/demo_catalog.json";
import events from "../../specs/events.spec.json";
import type { IntentCandidate } from "../generated/intent-schema";
export { config, catalog };
export type Freshness = NonNullable<IntentCandidate["patch"]["freshness"]>;
export type Target = NonNullable<
  IntentCandidate["patch"]["negativeTargets"]
>[number];
export type Scope = "session" | "long_term";
export type Protection = "off" | "active" | "review_required";
export type Preference = {
  freshness: Freshness;
  positiveTagIds: string[];
  negativeTargets: Target[];
};
export type Override = {
  freshness: Freshness | null;
  positiveTagIds: string[] | null;
  negativeTargets: Target[];
};
export type Field = keyof Preference | "protection";
export type Track = (typeof catalog.tracks)[number];
export type Source = "recommendation" | "search" | "playlist" | "unknown";
export type Log = Record<string, unknown> & {
  name: string;
  eventId: string;
  occurredAt: number;
};
export type Snapshot = {
  persistent: Preference;
  session: Override;
  protection: Protection;
  protectionStarted: number | null;
  sessionStarted: number | null;
};
export type Operation = {
  operationId: string;
  baseRevision: number;
  appliedRevision?: number;
  dirtyFields: Field[];
  scope: Scope;
  beforePatch: Snapshot;
  afterPatch?: Snapshot;
  fieldVersions?: Partial<Record<Field, number>>;
};
export type State = Snapshot & {
  schemaVersion: string;
  deviceSessionId: string;
  revision: number;
  fieldVersions: Record<Field, number>;
  now: number;
  lastListening: number;
  playing: boolean;
  trackId: string;
  source: Source;
  segmentStart: number | null;
  playbackInstanceId: string;
  playedSeconds: number;
  likes: string[];
  playlist: string[];
  logs: Log[];
  operations: Operation[];
  queue: string[];
  queueRevision: number;
  requestId: string;
  refreshStatus: "ready" | "failed" | "pending";
  aiEnabled: boolean;
};
export type Draft = {
  operationId: string;
  baseRevision: number;
  draftRevision: number;
  baseline: Preference;
  value: Preference;
  scope: Scope;
  protection: boolean;
  baselineProtection: boolean;
  promote: boolean;
  track: Track;
  dirtyFields: Field[];
  negativePatch: Target[] | null;
};
export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));
export const equal = (a: unknown, b: unknown) =>
  JSON.stringify(a) === JSON.stringify(b);
export const uniqueTargets = (a: Target[]) =>
  a.filter(
    (x, i) => a.findIndex((y) => x.kind === y.kind && x.id === y.id) === i,
  );
export const effective = (s: Snapshot): Preference => ({
  freshness: s.session.freshness ?? s.persistent.freshness,
  positiveTagIds: s.session.positiveTagIds ?? s.persistent.positiveTagIds,
  negativeTargets: uniqueTargets([
    ...s.persistent.negativeTargets,
    ...s.session.negativeTargets,
  ]),
});
export const snapshot = (s: State): Snapshot =>
  clone({
    persistent: s.persistent,
    session: s.session,
    protection: s.protection,
    protectionStarted: s.protectionStarted,
    sessionStarted: s.sessionStarted,
  });
export function rank(p: Preference, tracks: Track[] = catalog.tracks) {
  const r = config.ranking;
  return tracks
    .filter(
      (t) =>
        t.playable &&
        !catalog.seededTrackBlacklist.includes(t.id) &&
        !catalog.seededArtistBlacklist.includes(t.artistId),
    )
    .map((t) => {
      const positiveMatch = p.positiveTagIds.length
        ? p.positiveTagIds.filter((id) => t.tagIds.includes(id)).length /
          p.positiveTagIds.length
        : 0;
      const negativeMatch = p.negativeTargets.some((x) =>
        x.kind === "track"
          ? x.id === t.id
          : x.kind === "artist"
            ? x.id === t.artistId
            : t.tagIds.includes(x.id),
      )
        ? 1
        : 0;
      const noveltyTerm =
        r.noveltyWeight * r.freshnessSign[p.freshness] * (2 * t.novelty - 1);
      return {
        ...t,
        positiveMatch,
        negativeMatch,
        noveltyTerm,
        score:
          t.baseScore +
          r.positiveWeight * positiveMatch +
          noveltyTerm -
          r.negativePenalty * negativeMatch,
      };
    })
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
export function initial(now = Date.now()): State {
  const s: State = {
    schemaVersion: config.schemaVersion,
    deviceSessionId: crypto.randomUUID(),
    persistent: clone(catalog.initialPersistentPreference) as Preference,
    session: clone(catalog.initialSessionOverride),
    protection: "off",
    protectionStarted: null,
    sessionStarted: null,
    revision: 0,
    fieldVersions: {
      freshness: 0,
      positiveTagIds: 0,
      negativeTargets: 0,
      protection: 0,
    },
    now,
    lastListening: now,
    playing: false,
    trackId: catalog.tracks[0].id,
    source: "recommendation",
    segmentStart: null,
    playbackInstanceId: "",
    playedSeconds: 0,
    likes: [],
    playlist: [],
    logs: [],
    operations: [],
    queue: [],
    queueRevision: 0,
    requestId: "initial",
    refreshStatus: "ready",
    aiEnabled: true,
  };
  s.queue = rank(effective(s))
    .slice(0, config.ranking.listLength)
    .map((t) => t.id);
  return s;
}
export function log(
  s: State,
  name: string,
  extra: Record<string, unknown> = {},
) {
  if (!events.events.some((e) => e.name === name))
    throw Error("Unknown event " + name);
  s.logs.push({
    name,
    eventId: crypto.randomUUID(),
    occurredAt: s.now,
    deviceSessionId: s.deviceSessionId,
    sessionId: s.deviceSessionId,
    operationId: null,
    revision: s.revision,
    sourceScene: s.source,
    environment: "demo",
    schemaVersion: events.version,
    protection: s.protection,
    ...extra,
  });
}
export function splitSegment(s: State) {
  if (s.playing && s.segmentStart !== null && s.now > s.segmentStart)
    log(s, "playback_segment", {
      segmentId: crypto.randomUUID(),
      trackId: s.trackId,
      startAt: s.segmentStart,
      endAt: s.now,
      playedSeconds: (s.now - s.segmentStart) / 1000,
      longTermEligible: s.protection === "off" && s.source !== "unknown",
      isolationStateAtOccurrence: s.protection,
      isSimulated: true,
      queueOrigin: s.source,
    });
  s.segmentStart = s.playing ? s.now : null;
}
export function openDraft(s: State): Draft {
  const value = clone(effective(s));
  return {
    operationId: crypto.randomUUID(),
    baseRevision: s.revision,
    draftRevision: 0,
    baseline: clone(value),
    value,
    scope: config.feedback.defaultWriteScope as Scope,
    protection: s.protection !== "off",
    baselineProtection: s.protection !== "off",
    promote: false,
    track: clone(catalog.tracks.find((t) => t.id === s.trackId)!),
    dirtyFields: [],
    negativePatch: null,
  };
}
export function dirty(d: Draft, s: State): Field[] {
  const fields: Field[] = [];
  for (const f of ["freshness", "positiveTagIds"] as const)
    if (
      !equal(d.value[f], d.baseline[f]) ||
      (d.promote &&
        d.scope === "long_term" &&
        !equal(d.value[f], s.persistent[f]))
    )
      fields.push(f);
  if (
    d.negativePatch !== null &&
    (d.negativePatch.length === 0
      ? (d.scope === "session" ? s.session : s.persistent).negativeTargets
          .length > 0
      : d.negativePatch.some(
          (t) =>
            !(
              d.scope === "session" ? s.session : s.persistent
            ).negativeTargets.some((n) => equal(n, t)),
        ))
  )
    fields.push("negativeTargets");
  else if (
    d.promote &&
    d.scope === "long_term" &&
    s.session.negativeTargets.some(
      (t) => !s.persistent.negativeTargets.some((n) => equal(n, t)),
    )
  )
    fields.push("negativeTargets");
  if (d.protection !== d.baselineProtection) fields.push("protection");
  return fields;
}
export function changeDraft(d: Draft, changes: Partial<Draft>): Draft {
  return { ...clone(d), ...changes, draftRevision: d.draftRevision + 1 };
}
export function validate(p: Preference) {
  if (p.positiveTagIds.length > config.feedback.maxPositiveTags)
    return "最多选择3个方向，请先取消一项。";
  if (
    p.negativeTargets.some(
      (t) => t.kind === "tag" && p.positiveTagIds.includes(t.id),
    )
  )
    return "同一标签同时想听和少推，请返回保留一个；旧长期少推需先到已保存偏好明确移除。";
  return null;
}
export function setProtection(s: State, on: boolean, opId: string) {
  if (on === (s.protection !== "off")) return;
  splitSegment(s);
  s.protection = on ? "active" : "off";
  s.protectionStarted = on ? s.now : null;
  log(s, on ? "temporary_started" : "temporary_closed", {
    operationId: opId,
    effectiveFrom: s.now,
    endReason: "explicit_choice",
    backfillProtectedHistory: false,
  });
}
export function apply(
  state: State,
  d: Draft,
  fail = false,
): { state: State; error: string | null; operation?: Operation } {
  const existing = state.operations.find(
    (o) => o.operationId === d.operationId,
  );
  if (existing) return { state, error: null, operation: existing };
  const s = clone(state),
    fields = dirty(d, s);
  log(s, "preference_submit", {
    operationId: d.operationId,
    dirtyFields: fields,
    scope: d.scope,
    attempt:
      s.logs.filter(
        (x) =>
          x.name === "preference_submit" && x.operationId === d.operationId,
      ).length + 1,
  });
  const reject = (message: string) => {
    log(s, "preference_apply_failed", {
      operationId: d.operationId,
      errorType: message,
      isUnknown: false,
    });
    return { state: s, error: message };
  };
  if (d.baseRevision !== s.revision)
    return reject("版本冲突，草稿已保留。请核对当前设置后重试。");
  if (!fields.length) return reject("没有有效修改。");
  if (fail) return reject("保存失败，设置未改变；草稿已保留，可重试。");
  const next = clone(s);
  const bucket = d.scope === "session" ? next.session : next.persistent;
  for (const f of ["freshness", "positiveTagIds"] as const)
    if (fields.includes(f)) {
      if (f === "freshness") bucket.freshness = d.value.freshness;
      else bucket.positiveTagIds = clone(d.value.positiveTagIds);
      if (d.scope === "long_term") next.session[f] = null;
    }
  if (fields.includes("negativeTargets")) {
    const patch = d.negativePatch ?? next.session.negativeTargets;
    bucket.negativeTargets = patch.length
      ? uniqueTargets([...bucket.negativeTargets, ...patch])
      : [];
    if (
      bucket.negativeTargets.length > config.feedback.maxNegativeTargetsPerScope
    )
      return reject("当前范围最多10个少推对象，请先移除。");
    if (d.scope === "long_term")
      next.session.negativeTargets = next.session.negativeTargets.filter(
        (t) => !bucket.negativeTargets.some((n) => equal(n, t)),
      );
  }
  const error = validate(effective(next));
  if (error) return reject(error);
  const operation: Operation = {
    operationId: d.operationId,
    baseRevision: d.baseRevision,
    dirtyFields: fields,
    scope: d.scope,
    beforePatch: snapshot(s),
  };
  if (fields.includes("protection"))
    setProtection(next, d.protection, d.operationId);
  if (
    d.scope === "session" &&
    fields.some((f) => f !== "protection") &&
    next.sessionStarted === null
  ) {
    next.sessionStarted = next.now;
    next.lastListening = next.now;
  }
  next.revision++;
  for (const f of fields) next.fieldVersions[f] = next.revision;
  operation.appliedRevision = next.revision;
  operation.afterPatch = snapshot(next);
  operation.fieldVersions = clone(next.fieldVersions);
  next.operations.push(operation);
  next.requestId = crypto.randomUUID();
  next.refreshStatus = "pending";
  log(next, "preference_applied", {
    operationId: d.operationId,
    dirtyFields: fields,
    scope: d.scope,
    appliedRevision: next.revision,
  });
  return { state: next, error: null, operation };
}
export function refresh(
  state: State,
  requestId = state.requestId,
  revision = state.revision,
  fail = false,
  tracks = catalog.tracks,
): State {
  const s = clone(state);
  if (requestId !== s.requestId || revision !== s.revision) {
    log(s, "recommendation_refresh_failed", {
      requestId,
      errorType: "stale_response_discarded",
      responseRevision: revision,
    });
    return s;
  }
  if (fail) {
    s.refreshStatus = "failed";
    log(s, "recommendation_refresh_failed", {
      requestId,
      errorType: "simulated_refresh_failure",
    });
    return s;
  }
  s.queue = rank(effective(s), tracks)
    .slice(0, config.ranking.listLength)
    .map((t) => t.id);
  s.queueRevision = revision;
  s.refreshStatus = "ready";
  log(s, "recommendation_rendered", {
    requestId,
    trackIds: s.queue,
    rankVersion: config.ranking.formulaVersion,
  });
  return s;
}
export function undo(
  state: State,
  id: string,
): { state: State; error: string | null } {
  const s = clone(state),
    o = s.operations.find((o) => o.operationId === id);
  if (
    !o?.afterPatch ||
    o.dirtyFields.some((f) => s.fieldVersions[f] !== o.fieldVersions?.[f])
  )
    return { state, error: "设置已有新的修改，请查看当前状态后调整。" };
  const before = o.beforePatch;
  for (const f of o.dirtyFields) {
    if (f === "protection") {
      setProtection(s, before.protection !== "off", crypto.randomUUID());
      s.protection = before.protection;
      s.protectionStarted = before.protectionStarted;
      if (
        s.protection === "active" &&
        s.protectionStarted !== null &&
        s.now - s.protectionStarted >= config.session.maxHours * 3600000
      )
        s.protection = "review_required";
    } else if (f === "freshness") {
      s.persistent.freshness = before.persistent.freshness;
      s.session.freshness = before.session.freshness;
    } else if (f === "positiveTagIds") {
      s.persistent.positiveTagIds = clone(before.persistent.positiveTagIds);
      s.session.positiveTagIds = clone(before.session.positiveTagIds);
    } else {
      s.persistent.negativeTargets = clone(before.persistent.negativeTargets);
      s.session.negativeTargets = clone(before.session.negativeTargets);
    }
  }
  const conflict = validate(effective(s));
  if (conflict) return { state, error: conflict };
  s.revision++;
  for (const f of o.dirtyFields) s.fieldVersions[f] = s.revision;
  s.requestId = crypto.randomUUID();
  s.refreshStatus = "pending";
  log(s, "adjustment_undone", {
    undoOperationId: crypto.randomUUID(),
    targetOperationId: id,
    changedFields: o.dirtyFields,
  });
  return { state: s, error: null };
}
export function advance(state: State, ms: number): State {
  const s = clone(state);
  s.now += ms;
  if (s.playing) {
    s.lastListening = s.now;
    s.playedSeconds += ms / 1000;
  }
  const sessionIdle =
    !s.playing &&
    s.now - Math.max(s.lastListening, s.sessionStarted ?? s.now) >=
      config.session.idleMinutes * 60000;
  const protectionIdle =
    !s.playing &&
    s.now - Math.max(s.lastListening, s.protectionStarted ?? s.now) >=
      config.session.idleMinutes * 60000;
  const max = config.session.maxHours * 3600000;
  if (
    s.sessionStarted !== null &&
    (sessionIdle || s.now - s.sessionStarted >= max)
  ) {
    s.session = clone(catalog.initialSessionOverride);
    s.sessionStarted = null;
    s.revision++;
    for (const f of ["freshness", "positiveTagIds", "negativeTargets"] as const)
      s.fieldVersions[f] = s.revision;
    s.requestId = crypto.randomUUID();
    s.refreshStatus = "pending";
  }
  if (
    s.protection === "active" &&
    (protectionIdle || s.now - (s.protectionStarted ?? s.now) >= max)
  ) {
    splitSegment(s);
    s.protection = "review_required";
    log(s, "temporary_review_required", {
      reason: protectionIdle ? "idle" : "max_hours",
      stillProtected: true,
    });
  }
  return s;
}
export function playback(
  state: State,
  action: "toggle" | "next" | "heart" | "playlist",
  source?: Source,
): State {
  const s = clone(state);
  if (action === "heart" || action === "playlist") {
    const list = action === "heart" ? s.likes : s.playlist;
    if (!list.includes(s.trackId)) list.push(s.trackId);
    return s;
  }
  splitSegment(s);
  if (action === "next") {
    log(s, "track_skipped", {
      playbackInstanceId: s.playbackInstanceId,
      listenedSeconds: s.playedSeconds,
      technicalFailure: false,
      longTermEligible: s.protection === "off" && s.source !== "unknown",
    });
    const tracks =
      s.source === "recommendation"
        ? s.queue
        : catalog.tracks.filter((t) => t.playable).map((t) => t.id);
    s.trackId =
      tracks[(tracks.indexOf(s.trackId) + 1) % tracks.length] ?? s.trackId;
    s.playedSeconds = 0;
  } else s.playing = !s.playing;
  if (source) s.source = source;
  if (s.playing) {
    s.lastListening = s.now;
    s.segmentStart = s.now;
    s.playbackInstanceId = crypto.randomUUID();
    log(s, "track_started", {
      playbackInstanceId: s.playbackInstanceId,
      trackId: s.trackId,
      queueOrigin: s.source,
      isSimulated: true,
      longTermEligible: s.protection === "off" && s.source !== "unknown",
    });
  } else s.segmentStart = null;
  return s;
}
export function removeSaved(
  state: State,
  field: keyof Preference | "all",
  target?: string,
): State {
  const s = clone(state),
    fields: Field[] =
      field === "all"
        ? ["freshness", "positiveTagIds", "negativeTargets"]
        : [field];
  const o: Operation = {
    operationId: crypto.randomUUID(),
    baseRevision: s.revision,
    dirtyFields: fields,
    scope: "long_term",
    beforePatch: snapshot(s),
  };
  for (const f of fields) {
    if (f === "freshness") s.persistent.freshness = "balanced";
    if (f === "positiveTagIds")
      s.persistent.positiveTagIds = target
        ? s.persistent.positiveTagIds.filter((t) => t !== target)
        : [];
    if (f === "negativeTargets")
      s.persistent.negativeTargets = target
        ? s.persistent.negativeTargets.filter(
            (t) => t.kind + ":" + t.id !== target,
          )
        : [];
  }
  s.revision++;
  for (const f of fields) s.fieldVersions[f] = s.revision;
  o.appliedRevision = s.revision;
  o.fieldVersions = clone(s.fieldVersions);
  o.afterPatch = snapshot(s);
  s.operations.push(o);
  s.requestId = crypto.randomUUID();
  s.refreshStatus = "pending";
  log(s, "saved_preference_removed", {
    operationId: o.operationId,
    removedFieldNames: fields,
    removedTargetCount: 1,
  });
  return s;
}
