import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import tags from "../specs/tags.json";
import {
  apply,
  advance,
  catalog,
  clone,
  config,
  dirty,
  effective,
  initial,
  log,
  openDraft,
  playback,
  rank,
  refresh,
  removeSaved,
  setProtection,
  undo,
  changeDraft,
  type Draft,
  type State,
  type Target,
  type Scope,
  type Freshness,
} from "./domain/model";
import {
  adopt,
  candidateValid,
  currentEnvelope,
  LocalRuleAdapter,
  type IntentCandidate,
} from "./domain/ai";
import { Cover, Icon, tagLabel, freshLabel, targetLabel } from "./components";
import { restore, save, resetStorage } from "./storage";
type Panel =
  | "root"
  | "want"
  | "negative"
  | "impact"
  | "ai"
  | "manage"
  | "promote"
  | "discard";
export default function Demo({ preview = false }: { preview?: boolean }) {
  const [state, setState] = useState(() =>
    preview ? initial() : restore(sessionStorage),
  );
  const stateRef = useRef(state);
  stateRef.current = state;
  const [draft, setDraft] = useState<Draft | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const [panel, setPanel] = useState<Panel>("root");
  const [quick, setQuick] = useState(false);
  const [scenario, setScenario] = useState(1);
  const [queueOpen, setQueueOpen] = useState(false);
  const [notes, setNotes] = useState(false);
  const [failure, setFailure] = useState("none");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState("");
  const [input, setInput] = useState("");
  const [candidate, setCandidate] = useState<IntentCandidate | null>(null);
  const [parseState, setParseState] = useState("idle");
  const [aiError, setAiError] = useState("");
  const activeRequest = useRef("");
  const abort = useRef<AbortController | null>(null);
  const [remove, setRemove] = useState<{
    field: "freshness" | "positiveTagIds" | "negativeTargets" | "all";
    target?: string;
  } | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchY = useRef<number | null>(null);
  const ownsHistoryEntry = useRef(false);
  useEffect(() => {
    const handleBack = () => {
      if (!draftRef.current) return;
      if (panel !== "root" && panel !== "manage") {
        abort.current?.abort();
        activeRequest.current = "";
        setPanel("root");
        history.pushState({ ...history.state, recommendationSheet: true }, "");
      } else {
        ownsHistoryEntry.current = false;
        close();
      }
    };
    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [panel]);
  useEffect(() => {
    if (!preview)
      try {
        save(sessionStorage, state);
      } catch {
        setStorageWarning(true);
      }
  }, [state, preview]);
  useEffect(() => {
    if (!receipt) return;
    const timer = setTimeout(() => setReceipt(""), config.measurement.toastMs);
    return () => clearTimeout(timer);
  }, [receipt]);
  useEffect(() => {
    if (draft && !dialog.current?.open) dialog.current?.showModal();
  }, [draft]);
  useEffect(() => {
    const timer = setInterval(() => {
      const s = stateRef.current;
      const elapsed = Math.max(0, Date.now() - s.now);
      if (elapsed > 0) {
        let next = advance(s, elapsed);
        if (next.refreshStatus === "pending" && next.revision !== s.revision)
          next = refresh(next);
        update(next);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const entry = document.querySelector(
      preview
        ? ".demo-preview .product .primary"
        : ".demo-page .product .primary",
    );
    if (!entry) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let exposed = false;
    const observer = new IntersectionObserver(
      ([e]) => {
        if (timer) clearTimeout(timer);
        if (
          e.intersectionRatio >= config.measurement.visibleExposureRatio &&
          !exposed
        )
          timer = setTimeout(() => {
            exposed = true;
            const s = clone(stateRef.current);
            log(s, "entry_exposed", {
              entryId: "adjust",
              visibleMs: config.measurement.visibleExposureMs,
            });
            update(s);
          }, config.measurement.visibleExposureMs);
      },
      { threshold: config.measurement.visibleExposureRatio },
    );
    observer.observe(entry);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [preview]);
  useEffect(() => {
    const listener = () => {
      if (!document.hidden && !preview)
        setState((s) => advance(s, Math.max(0, Date.now() - s.now)));
    };
    document.addEventListener("visibilitychange", listener);
    return () => document.removeEventListener("visibilitychange", listener);
  }, [preview]);
  const track = catalog.tracks.find((t) => t.id === state.trackId)!;
  const p = effective(state);
  const last = state.operations.at(-1);
  const protectedText =
    state.protection === "review_required"
      ? "已到提醒时间，当前仍不用于长期推荐。"
      : state.protection === "active"
        ? "临时收听中 · 普通收听不用于长期推荐"
        : "临时收听未开启";
  function update(s: State) {
    setState(s);
    stateRef.current = s;
  }
  function edit(changes: Partial<Draft>) {
    if (draft) {
      const d = changeDraft(draft, changes);
      setDraft(d);
      draftRef.current = d;
      setMessage("");
    }
  }
  function open(next: Panel = "root", isQuick = false) {
    history.pushState({ ...history.state, recommendationSheet: true }, "");
    ownsHistoryEntry.current = true;
    opener.current = document.activeElement as HTMLElement;
    const d = openDraft(state);
    setDraft(d);
    draftRef.current = d;
    setPanel(next);
    setQuick(isQuick);
    setMessage("");
    setInput("");
    setCandidate(null);
    setParseState("idle");
    const s = clone(state);
    log(s, "adjustment_opened", {
      editingSessionId: d.operationId,
      entryId: isQuick ? "more" : "adjust",
      baseRevision: d.baseRevision,
    });
    update(s);
  }
  function close() {
    abort.current?.abort();
    activeRequest.current = "";
    dialog.current?.close();
    setDraft(null);
    draftRef.current = null;
    setCandidate(null);
    setInput("");
    setMessage("");
    setRemove(null);
    opener.current?.focus();
    if (ownsHistoryEntry.current) {
      ownsHistoryEntry.current = false;
      history.back();
    }
  }
  function back() {
    if (panel === "root" || panel === "manage") close();
    else {
      abort.current?.abort();
      activeRequest.current = "";
      setPanel("root");
      setMessage("");
    }
  }
  function submit(confirmed = false) {
    if (!draft) return;
    const fields = dirty(draft, state);
    if (
      draft.scope === "long_term" &&
      fields.some((f) => f !== "protection") &&
      !confirmed
    ) {
      setPanel("promote");
      return;
    }
    const result = apply(state, draft, failure === "save");
    update(result.state);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    const s = refresh(
      result.state,
      result.state.requestId,
      result.state.revision,
      failure === "refresh",
    );
    update(s);
    setReceipt(
      `${draft.scope === "session" ? "仅本次" : "长期偏好"}已保存 · ${fields.map((f) => ({ freshness: freshLabel(draft.value.freshness), positiveTagIds: draft.value.positiveTagIds.map(tagLabel).join("、") || "清空方向", negativeTargets: "少推 " + (draft.negativePatch ?? []).map(targetLabel).join("、") + "，仍可能出现", protection: draft.protection ? "开启临时保护" : "关闭临时保护" })[f]).join(" / ")} · revision ${s.revision}`,
    );
    close();
  }
  function doUndo() {
    if (!last) return;
    const r = undo(state, last.operationId);
    if (r.error) setMessage(r.error);
    else {
      update(refresh(r.state));
      setMessage("已撤销本轮调整。");
    }
  }
  function toggleTag(id: string) {
    if (!draft) return;
    const ids = draft.value.positiveTagIds;
    if (!ids.includes(id) && ids.length >= config.feedback.maxPositiveTags) {
      setMessage("最多选择3个方向，请先取消一项。");
      return;
    }
    edit({
      value: {
        ...draft.value,
        positiveTagIds: ids.includes(id)
          ? ids.filter((x) => x !== id)
          : [...ids, id],
      },
    });
  }
  async function runParse() {
    if (!draft) return;
    const id = crypto.randomUUID(),
      revision = draft.draftRevision;
    activeRequest.current = id;
    abort.current?.abort();
    abort.current = new AbortController();
    setCandidate(null);
    setParseState("parsing");
    setAiError("");
    const s = clone(stateRef.current);
    log(s, "parse_requested", {
      requestId: id,
      adapterMode: config.ai.adapterDefault,
      inputLength: [...input].length,
    });
    update(s);
    const e = await new LocalRuleAdapter().parse(
      {
        requestId: id,
        draftRevision: revision,
        inputText: input,
        currentTrackId: draft.track.id as "T01",
        currentArtistId: draft.track.artistId as "A01",
        currentStyleIds: draft.track.tagIds.filter((x) =>
          x.startsWith("genre_"),
        ) as ["genre_folk"],
      },
      abort.current.signal,
    );
    if (
      id !== activeRequest.current ||
      draftRef.current?.draftRevision !== revision
    ) {
      const stale = clone(stateRef.current);
      log(stale, "parse_finished", {
        requestId: id,
        adapterMode: e.adapterMode,
        status: e.transportStatus === "cancelled" ? "cancelled" : "stale",
        errorCategory: "candidate_discarded",
        latencyMs: null,
      });
      update(stale);
      return;
    }
    const next = clone(stateRef.current);
    log(next, "parse_finished", {
      requestId: id,
      adapterMode: e.adapterMode,
      status: e.candidate?.status ?? e.transportStatus,
      errorCategory: e.errorCode ?? null,
      latencyMs: null,
    });
    update(next);
    if (currentEnvelope(e, id, revision) && e.candidate) {
      setCandidate(e.candidate);
      setParseState(e.candidate.status);
    } else {
      setParseState(e.transportStatus);
      setAiError(e.errorCode ?? "解析已取消，可改用手动设置。");
    }
  }
  function adoptCandidate() {
    if (!draft || !candidate) return;
    setDraft(adopt(draft, candidate));
    const s = clone(state);
    log(s, "candidate_adopted", {
      requestId: activeRequest.current,
      draftRevision: draft.draftRevision,
      changedFields: Object.entries(candidate.patch)
        .filter(([, v]) => v !== null)
        .map(([k]) => k),
    });
    update(s);
    setPanel("root");
    setMessage(
      candidate.scopeSuggestion !== null ||
        candidate.isolationSuggestion !== null
        ? "范围/保护仅为建议，请到影响范围手动选择；当前未自动改变。"
        : "候选已进入草稿，尚未应用。",
    );
  }
  function protection(on: boolean) {
    const s = clone(state);
    setProtection(s, on, crypto.randomUUID());
    s.revision++;
    s.fieldVersions.protection = s.revision;
    update(s);
    setMessage(
      on
        ? "临时收听已开启。"
        : "已关闭，仅后续普通收听恢复参与推荐；已隔离片段不回填。",
    );
  }
  const draftFields = draft ? dirty(draft, state) : [];
  function negativeChoice(t: Target) {
    edit({ negativePatch: [t] });
  }
  const rootRows = draft
    ? [
        [
          "本次想听",
          freshLabel(draft.value.freshness) +
            " · " +
            (draft.value.positiveTagIds.map(tagLabel).join("、") || "不限方向"),
          "want",
        ],
        [
          "不想听",
          draft.negativePatch
            ? draft.negativePatch.map(targetLabel).join("、") ||
              "清空本范围少推"
            : draft.value.negativeTargets.map(targetLabel).join("、") ||
              "暂无少推",
          "negative",
        ],
        [
          "影响范围",
          (draft.scope === "session" ? "仅本次" : "长期偏好") +
            " · " +
            (draft.protection ? "临时保护开启" : "临时保护关闭"),
          "impact",
        ],
      ]
    : [];
  return (
    <div className={preview ? "demo-preview" : "demo-page"}>
      {!preview && (
        <header className="demo-toolbar">
          <Link to="/">← 返回案例</Link>
          <div className="scenario-tabs" role="group" aria-label="演示任务">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                aria-pressed={scenario === n}
                onClick={() => {
                  setScenario(n);
                  setQueueOpen(false);
                }}
              >{`Demo ${n}`}</button>
            ))}
            {state.aiEnabled && (
              <button onClick={() => open("ai")}>AI 实验</button>
            )}
          </div>
          <button
            onClick={() => {
              resetStorage(sessionStorage);
              update(initial());
              setMessage("演示已重置，仅清理项目命名空间。");
              setReceipt("");
            }}
          >
            重置演示
          </button>
        </header>
      )}
      <div className="demo-layout" role={preview ? undefined : "main"}>
        <div className="product" data-testid="product">
          <div className="product-top">
            <span className="eyebrow">
              {preview ? "LIVE PROTOTYPE" : "交互模拟 · 不播放声音"}
            </span>
            <button onClick={() => setQueueOpen(!queueOpen)}>
              {queueOpen ? "返回播放器" : "推荐队列"}{" "}
              <span aria-hidden="true">≡</span>
            </button>
          </div>
          <div
            className={
              "protection-bar " + (state.protection === "off" ? "off" : "on")
            }
          >
            <Icon name="shield" />
            <span>{protectedText}</span>
          </div>
          {state.protection === "review_required" && (
            <div className="reminder">
              <p>保护继续，直到你明确选择。</p>
              <div className="actions">
                <button
                  onClick={() => {
                    const s = clone(state);
                    s.protection = "active";
                    s.protectionStarted = s.now;
                    s.lastListening = s.now;
                    update(s);
                  }}
                >
                  继续4小时
                </button>
                <button onClick={() => protection(false)}>关闭临时收听</button>
              </div>
            </div>
          )}
          {!queueOpen ? (
            <>
              <div className="record-stage">
                <div className="tonearm" aria-hidden="true" />
                <div className="record">
                  <div className="groove">
                    <Cover />
                  </div>
                </div>
              </div>
              <div className="track-heading">
                <div>
                  <h2>{track.title.replace("（演示）", "")}</h2>
                  <p>
                    {track.artistName} <span aria-hidden="true">↗</span>
                  </p>
                </div>
                <button
                  className="icon-button"
                  aria-label="收藏当前虚构歌曲"
                  aria-pressed={state.likes.includes(track.id)}
                  onClick={() => update(playback(state, "heart"))}
                >
                  <Icon name="heart" />
                </button>
              </div>
              <div
                className="progress-line"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={track.durationSeconds}
                aria-valuenow={0}
                aria-label="模拟播放进度"
              />
              <div className="time-row">
                <span>00:00</span>
                <span>合成曲库 · 无真实音频</span>
                <span>
                  {Math.floor(track.durationSeconds / 60)}:
                  {String(track.durationSeconds % 60).padStart(2, "0")}
                </span>
              </div>
              <div className="play-controls">
                <button
                  onClick={() => open("negative", true)}
                  aria-label="更多：快捷少推"
                >
                  •••
                </button>
                <button
                  className="play-button"
                  aria-label={state.playing ? "暂停模拟" : "播放模拟"}
                  onClick={() => update(playback(state, "toggle"))}
                >
                  <Icon name={state.playing ? "pause" : "play"} />
                </button>
                <button
                  aria-label="下一首模拟歌曲"
                  onClick={() => update(playback(state, "next"))}
                >
                  <Icon name="next" />
                </button>
              </div>
              <button className="primary full" onClick={() => open()}>
                <Icon name="sliders" /> 调整推荐
              </button>
              <p className="effective-summary">
                {freshLabel(p.freshness)} ·{" "}
                {p.positiveTagIds.map(tagLabel).join(" / ") || "不限方向"}
                {p.negativeTargets.length
                  ? ` · ${p.negativeTargets.length}项少推`
                  : ""}
              </p>
            </>
          ) : (
            <div className="queue">
              <div className="queue-title">
                <h2>演示推荐</h2>
                <button onClick={() => open()}>调整推荐</button>
              </div>
              <p className="helper">
                已展示 revision {state.queueRevision} · 设置 revision{" "}
                {state.revision}。排序只作用于自动推荐，当前歌不被打断。
              </p>
              {state.queue.length === 0 ? (
                <div className="empty">
                  <h3>当前没有可用结果</h3>
                  <p>保留全部强约束与当前播放；没有放宽黑名单。</p>
                  <button onClick={() => update(refresh(state))}>
                    恢复正常候选池
                  </button>
                </div>
              ) : (
                state.queue.map((id, i) => {
                  const t = catalog.tracks.find((x) => x.id === id)!;
                  return (
                    <div className="queue-row" key={id}>
                      <span className="rank-number">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Cover small />
                      <div>
                        <strong>{t.title.replace("（演示）", "")}</strong>
                        <p>
                          {t.artistName} ·{" "}
                          {t.tagIds.slice(0, 2).map(tagLabel).join(" / ")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
          {state.refreshStatus === "failed" && (
            <div className="notice" role="status">
              <strong>设置已保存，推荐尚未刷新。</strong>
              <p>已确认的偏好与保护继续生效。</p>
              <button onClick={() => update(refresh(state))}>重试刷新</button>
              <button onClick={() => setQueueOpen(false)}>继续听歌</button>
            </div>
          )}
          {receipt && (
            <div className="notice" role="status">
              {receipt}
              <button onClick={doUndo}>撤销</button>
            </div>
          )}
          {!draft && message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          {!preview && (
            <div className="current-state">
              <details>
                <summary>当前调整与恢复 · revision {state.revision}</summary>
                <p>
                  {freshLabel(p.freshness)} /{" "}
                  {p.positiveTagIds.map(tagLabel).join("、") || "不限方向"}
                </p>
                <p>
                  少推：
                  {p.negativeTargets.map(targetLabel).join("、") || "暂无"}
                  。仍可能出现。
                </p>
                <div className="actions">
                  <button disabled={!last} onClick={doUndo}>
                    撤销上次调整
                  </button>
                  <button
                    onClick={() => {
                      const s = clone(state);
                      s.session = clone(catalog.initialSessionOverride);
                      s.sessionStarted = null;
                      s.revision++;
                      for (const f of [
                        "freshness",
                        "positiveTagIds",
                        "negativeTargets",
                      ] as const)
                        s.fieldVersions[f] = s.revision;
                      s.requestId = crypto.randomUUID();
                      update(refresh(s));
                      setMessage(
                        "本次调整已结束，恢复项目长期偏好；临时保护状态不变。",
                      );
                    }}
                  >
                    结束本次调整
                  </button>
                  <button onClick={() => open("manage")}>已保存偏好</button>
                </div>
              </details>
            </div>
          )}
          <div className="mini-player">
            <Cover small />
            <div>
              <strong>{track.title.replace("（演示）", "")}</strong>
              <span>
                {state.protection === "off"
                  ? "普通收听可参与长期推荐"
                  : "保护持续 · 普通收听不参与长期推荐"}
              </span>
            </div>
            <Icon name={state.protection === "off" ? "play" : "shield"} />
          </div>
        </div>
        {!preview && (
          <aside className="product-notes">
            <div className="section-label">TRY THE DECISION</div>
            <h1>
              {
                [
                  "",
                  "这次，听一点新的。",
                  "少听一点，不必永远屏蔽。",
                  "让临时场景，留在本次。",
                ][scenario]
              }
            </h1>
            <p>
              {
                [
                  "",
                  "选择探索与民谣，仅本次应用。看看后续推荐如何变化，再试着撤销。",
                  "从播放器“•••”进入，少推当前音乐人，再撤销。少推是软降权，仍可能出现。",
                  "开启临时收听，再从歌单播放。推进到提醒点，检查当前是否仍受保护。",
                ][scenario]
              }
            </p>
            <div className="rule-note">
              <span>两个独立的选择</span>
              <p>设置保存多久，与你希望普通收听如何影响长期推荐，是两件事。</p>
            </div>
            <label className="source-select">
              新建受控播放来源
              <select
                value={state.source}
                onChange={(e) => {
                  let s = state.playing ? playback(state, "toggle") : state;
                  s = { ...s, source: e.target.value as State["source"] };
                  update(playback(s, "toggle"));
                }}
              >
                <option value="recommendation">每日推荐 / 自动队列</option>
                <option value="search">搜索来源 / 手动播放</option>
                <option value="playlist">歌单来源 / 手动顺序</option>
              </select>
            </label>
            <button
              onClick={() => {
                update(playback(state, "playlist"));
                setMessage("已加入本地虚构歌单，主动操作会保留。");
              }}
            >
              加入本地虚构歌单
            </button>
            {state.aiEnabled && (
              <button className="text-button" onClick={() => open("ai")}>
                AI 建议草稿（实验） ↗
              </button>
            )}
            <button
              className="full"
              aria-expanded={notes}
              onClick={() => setNotes(!notes)}
            >
              Product Notes · {notes ? "收起" : "查看规则与模拟失败"}
            </button>
            {notes && (
              <div className="notes-content">
                <p>演示公式，不是网易云真实算法。全部事件只留在本地。</p>
                <label>
                  下次保存场景
                  <select
                    value={failure}
                    onChange={(e) => setFailure(e.target.value)}
                  >
                    <option value="none">正常</option>
                    <option value="save">保存失败</option>
                    <option value="refresh">保存成功、刷新失败</option>
                  </select>
                </label>
                <div className="actions">
                  <button
                    onClick={() =>
                      update(
                        refresh(
                          advance(state, config.session.idleMinutes * 60000),
                        ),
                      )
                    }
                  >
                    推进30分钟
                  </button>
                  <button
                    onClick={() =>
                      update(
                        refresh(
                          advance(state, config.session.maxHours * 3600000),
                        ),
                      )
                    }
                  >
                    推进4小时
                  </button>
                  <button
                    onClick={() => {
                      update(
                        refresh(
                          state,
                          "old-request",
                          Math.max(0, state.revision - 1),
                        ),
                      );
                      setMessage("旧响应已丢弃，当前队列与 revision 未改变。");
                    }}
                  >
                    旧响应晚到
                  </button>
                  <button
                    onClick={() => {
                      open();
                      setFailure("none");
                      const s = clone(state);
                      s.revision++;
                      update(s);
                    }}
                  >
                    打开并模拟版本冲突
                  </button>
                  <button
                    onClick={() => {
                      if (!last) return;
                      const s = clone(state);
                      s.revision++;
                      s.fieldVersions[last.dirtyFields[0]] = s.revision;
                      update(s);
                      setMessage("已模拟后续相关修改，请尝试撤销。");
                    }}
                  >
                    模拟撤销冲突
                  </button>
                  <button
                    onClick={() =>
                      update(
                        refresh(
                          state,
                          state.requestId,
                          state.revision,
                          false,
                          [],
                        ),
                      )
                    }
                  >
                    模拟结果为空
                  </button>
                  <button
                    onClick={() => {
                      update(
                        refresh(
                          state,
                          state.requestId,
                          state.revision,
                          false,
                          catalog.tracks.slice(0, 2),
                        ),
                      );
                      setQueueOpen(true);
                      setMessage(
                        "候选不足，仅保留可用结果；没有解除任何约束。",
                      );
                    }}
                  >
                    模拟候选不足
                  </button>
                </div>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={state.aiEnabled}
                    onChange={(e) =>
                      update({ ...state, aiEnabled: e.target.checked })
                    }
                  />
                  启用 R07 本地实验
                </label>
                <details>
                  <summary>排序分数与前后列表</summary>
                  <p>
                    初始：
                    {rank(
                      catalog.initialPersistentPreference as ReturnType<
                        typeof effective
                      >,
                    )
                      .slice(0, config.ranking.listLength)
                      .map((t) => t.id)
                      .join(" → ")}
                  </p>
                  {rank(p).map((t) => (
                    <p key={t.id}>
                      {t.id}：{t.score.toFixed(4)} = {t.baseScore} + 正向{" "}
                      {(
                        config.ranking.positiveWeight * t.positiveMatch
                      ).toFixed(3)}{" "}
                      + 新鲜 {t.noveltyTerm.toFixed(3)} − 少推{" "}
                      {(
                        config.ranking.negativePenalty * t.negativeMatch
                      ).toFixed(1)}
                    </p>
                  ))}
                </details>
                <details>
                  <summary>本地事件日志（{state.logs.length}）</summary>
                  <pre>{JSON.stringify(state.logs, null, 2)}</pre>
                </details>
                <button
                  onClick={() => {
                    const url = URL.createObjectURL(
                      new Blob([JSON.stringify(state.logs, null, 2)], {
                        type: "application/json",
                      }),
                    );
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "synthetic-events.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  导出本地事件 JSON
                </button>
              </div>
            )}
            <p className="disclaimer">
              个人产品概念，非网易官方项目。歌曲与推荐数据为演示数据；未调用真实模型，不连接真实音乐账号。
            </p>
            {storageWarning && (
              <p role="status">存储不可用，当前为内存模式；刷新后将重置。</p>
            )}
          </aside>
        )}
      </div>
      <dialog
        ref={dialog}
        className="sheet"
        aria-labelledby="sheet-title"
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const nodes = Array.from(
            dialog.current!.querySelectorAll<HTMLElement>(
              "button:not(:disabled),input:not(:disabled),select,textarea,summary,a[href]",
            ),
          ).filter((el) => el.getClientRects().length > 0);
          const first = nodes[0],
            last = nodes.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
        onCancel={(e) => {
          e.preventDefault();
          back();
        }}
        onClick={(e) => {
          if (e.target === dialog.current) close();
        }}
      >
        {draft && (
          <div className="sheet-inner">
            <div
              className="sheet-grab"
              onTouchStart={(e) => (touchY.current = e.touches[0].clientY)}
              onTouchEnd={(e) => {
                if (
                  touchY.current !== null &&
                  e.changedTouches[0].clientY - touchY.current > 80
                )
                  close();
                touchY.current = null;
              }}
              aria-hidden="true"
            />
            <header className="sheet-header">
              <h2 id="sheet-title">
                {
                  {
                    root: "调整推荐",
                    want: "本次想听",
                    negative: "不想听",
                    impact: "影响范围",
                    ai: "AI 建议草稿（实验）",
                    manage: "已保存偏好",
                    promote: "确认长期保存差异",
                    discard: "放弃本轮未提交修改？",
                  }[panel]
                }
              </h2>
              <button aria-label="关闭并放弃草稿" onClick={close}>
                <Icon name="close" />
              </button>
            </header>
            {panel === "ai" && (
              <p className="simulation-label fixed-label">
                本地规则模拟 · 不调用真实模型
              </p>
            )}
            <div className="sheet-body">
              {panel === "root" && (
                <>
                  <p className="helper">
                    {draftFields.length ? "草稿待确认" : "当前设置 · 尚未修改"}
                  </p>
                  {rootRows.map(([title, summary, next]) => (
                    <button
                      className="sheet-row"
                      key={title}
                      onClick={() => setPanel(next as Panel)}
                    >
                      <span>
                        <strong>{title}</strong>
                        <small>{summary}</small>
                      </span>
                      <span aria-hidden="true">›</span>
                    </button>
                  ))}
                  <button
                    className="text-button"
                    onClick={() => {
                      setPanel(draftFields.length ? "discard" : "manage");
                    }}
                  >
                    已保存偏好 →
                  </button>
                </>
              )}
              {panel === "want" && (
                <>
                  <fieldset>
                    <legend>新鲜程度</legend>
                    <div className="segmented">
                      {(["familiar", "balanced", "explore"] as const).map(
                        (f) => (
                          <label
                            key={f}
                            className={
                              draft.value.freshness === f ? "selected" : ""
                            }
                          >
                            <input
                              type="radio"
                              name="freshness"
                              value={f}
                              checked={draft.value.freshness === f}
                              onChange={() =>
                                edit({
                                  value: { ...draft.value, freshness: f },
                                })
                              }
                            />
                            {freshLabel(f)}
                          </label>
                        ),
                      )}
                    </div>
                  </fieldset>
                  <p className="helper">
                    熟悉已知方向，或探索新内容；不等于随机。
                  </p>
                  <div className="subheading">
                    <h3>内容方向</h3>
                    <span>
                      {draft.value.positiveTagIds.length} /{" "}
                      {config.feedback.maxPositiveTags}
                    </span>
                  </div>
                  {[...new Set(tags.tags.map((t) => t.category))].map(
                    (category) => (
                      <fieldset key={category}>
                        <legend>{category}</legend>
                        <div className="tag-grid">
                          {tags.tags
                            .filter((t) => t.category === category)
                            .map((t) => (
                              <button
                                key={t.id}
                                aria-pressed={draft.value.positiveTagIds.includes(
                                  t.id,
                                )}
                                onClick={() => toggleTag(t.id)}
                              >
                                {draft.value.positiveTagIds.includes(t.id)
                                  ? "✓ "
                                  : ""}
                                {t.label}
                              </button>
                            ))}
                        </div>
                      </fieldset>
                    ),
                  )}
                  <button
                    className="text-button"
                    onClick={() =>
                      edit({ value: { ...draft.value, positiveTagIds: [] } })
                    }
                  >
                    清空想听的标签
                  </button>
                  <p className="helper">方向是软偏好，不保证只出现选中标签。</p>
                </>
              )}
              {panel === "negative" && (
                <>
                  <p>
                    会减少出现机会，<strong>仍可能遇到。</strong>
                  </p>
                  <p className="helper">
                    对象绑定打开时的歌曲：{draft.track.title}
                  </p>
                  <fieldset>
                    <legend>本次新增一个少推对象</legend>
                    {(
                      [
                        { kind: "track", id: draft.track.id },
                        { kind: "artist", id: draft.track.artistId },
                        ...draft.track.tagIds
                          .filter((x) => x.startsWith("genre_"))
                          .slice(0, 1)
                          .map((id) => ({ kind: "tag", id })),
                      ] as Target[]
                    ).map((t) => (
                      <label className="radio-row" key={t.kind}>
                        <input
                          type="radio"
                          name="negative"
                          checked={
                            draft.negativePatch?.some(
                              (x) => x.kind === t.kind && x.id === t.id,
                            ) ?? false
                          }
                          onChange={() => negativeChoice(t)}
                        />
                        <span>
                          少推
                          {t.kind === "track"
                            ? "歌曲"
                            : t.kind === "artist"
                              ? "音乐人"
                              : "风格"}
                          <small>{targetLabel(t)}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <button onClick={() => edit({ negativePatch: [] })}>
                    清空当前范围少推项
                  </button>
                  <details className="blacklist">
                    <summary>黑名单 · 只读示例</summary>
                    <p>
                      强屏蔽：{catalog.seededTrackBlacklist.join("、")} /{" "}
                      {catalog.seededArtistBlacklist.join("、")}{" "}
                      不进入自动推荐。首版不可修改，少推不会自动升级为黑名单。
                    </p>
                  </details>
                </>
              )}
              {panel === "impact" && (
                <>
                  <fieldset>
                    <legend>这轮明确调整，保存多久？</legend>
                    {(["session", "long_term"] as Scope[]).map((scope) => (
                      <label className="radio-row" key={scope}>
                        <input
                          type="radio"
                          name="scope"
                          checked={draft.scope === scope}
                          onChange={() => edit({ scope, promote: false })}
                        />
                        <span>
                          {scope === "session" ? "仅本次" : "长期偏好"}
                          <small>
                            {scope === "session"
                              ? "只保存这轮调整；不自动阻止普通听歌学习。"
                              : "只长期保存本轮明确修改的字段。"}
                          </small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  {draft.scope === "long_term" &&
                    JSON.stringify(draft.value) !==
                      JSON.stringify(state.persistent) && (
                      <label className="check-row">
                        <input
                          type="checkbox"
                          checked={draft.promote}
                          onChange={(e) => edit({ promote: e.target.checked })}
                        />
                        保存当前差异到长期
                      </label>
                    )}
                  <div className="protection-setting">
                    <label className="check-row">
                      <input
                        role="switch"
                        type="checkbox"
                        checked={draft.protection}
                        onChange={(e) => edit({ protection: e.target.checked })}
                      />
                      <strong>本次听歌不影响长期推荐</strong>
                    </label>
                    <p>
                      开启后，本设备的普通播放、时长和跳过不用于长期推荐。收藏等主动操作仍会保留。
                    </p>
                  </div>
                  <div className="impact-summary">
                    <strong>本轮选择</strong>
                    <p>
                      {draft.scope === "session"
                        ? "显式设置仅本次保存。"
                        : "本轮明确选择会长期保存。"}
                      {draft.protection
                        ? "普通收听受到保护。"
                        : "普通收听仍可能影响长期推荐。"}
                    </p>
                    <small>开关只改草稿，确认调整后才生效。</small>
                  </div>
                </>
              )}
              {panel === "promote" && (
                <>
                  <p>确认后长期保存以下差异，并清理同字段的本次覆盖。</p>
                  <ul>
                    {draftFields.map((f) => (
                      <li key={f}>
                        {f === "freshness"
                          ? `新鲜程度：${freshLabel(state.persistent.freshness)} → ${freshLabel(draft.value.freshness)}`
                          : f === "positiveTagIds"
                            ? `内容方向：${state.persistent.positiveTagIds.map(tagLabel).join("、") || "空"} → ${draft.value.positiveTagIds.map(tagLabel).join("、") || "清空"}`
                            : f === "negativeTargets"
                              ? `少推：${(draft.negativePatch ?? state.session.negativeTargets).map(targetLabel).join("、") || "清空本范围"}`
                              : `普通收听保护：${draft.protection ? "开启" : "关闭"}`}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {panel === "discard" && (
                <p>
                  进入长期管理需先放弃这份草稿；默认保留，管理提交是独立事务。
                </p>
              )}
              {panel === "manage" && (
                <>
                  <p className="helper">
                    仅管理本项目的长期设置，不删除平台画像、红心或黑名单。
                  </p>
                  <div className="saved-row">
                    <span>
                      新鲜程度：{freshLabel(state.persistent.freshness)}
                    </span>
                    <button onClick={() => setRemove({ field: "freshness" })}>
                      恢复平衡
                    </button>
                  </div>
                  {state.persistent.positiveTagIds.map((id) => (
                    <div className="saved-row" key={id}>
                      {tagLabel(id)}
                      <button
                        aria-label={"移除" + tagLabel(id)}
                        onClick={() =>
                          setRemove({ field: "positiveTagIds", target: id })
                        }
                      >
                        移除
                      </button>
                    </div>
                  ))}
                  {state.persistent.negativeTargets.map((t) => (
                    <div className="saved-row" key={t.kind + t.id}>
                      少推 {targetLabel(t)}
                      <button
                        onClick={() =>
                          setRemove({
                            field: "negativeTargets",
                            target: t.kind + ":" + t.id,
                          })
                        }
                      >
                        移除
                      </button>
                    </div>
                  ))}
                  {!state.persistent.positiveTagIds.length &&
                    !state.persistent.negativeTargets.length && (
                      <p>暂无已保存标签或少推项。</p>
                    )}
                  <button onClick={() => setRemove({ field: "all" })}>
                    清空本项目长期偏好
                  </button>
                  {remove && (
                    <div className="notice">
                      <p>
                        确认移除
                        {remove.field === "all"
                          ? "全部项目长期设置"
                          : "所选长期项"}
                        ？
                      </p>
                      <button onClick={() => setRemove(null)}>保留</button>
                      <button
                        onClick={() => {
                          const s = refresh(
                            removeSaved(state, remove.field, remove.target),
                          );
                          update(s);
                          setDraft(openDraft(s));
                          setRemove(null);
                          setMessage("已移除所选长期设置，可撤销。");
                        }}
                      >
                        确认移除
                      </button>
                    </div>
                  )}
                  <button disabled={!last} onClick={doUndo}>
                    撤销上次调整
                  </button>
                </>
              )}
              {panel === "ai" && (
                <>
                  <label htmlFor="ai-input">描述这次想听什么</label>
                  <textarea
                    id="ai-input"
                    rows={3}
                    placeholder="例如：这次想探索民谣"
                    value={input}
                    onChange={(e) => {
                      abort.current?.abort();
                      activeRequest.current = "";
                      setInput(e.target.value);
                      setCandidate(null);
                      setParseState("idle");
                    }}
                  />
                  <p className="helper">
                    {[...input].length} / {config.ai.maxInputUnicodeCodePoints}{" "}
                    Unicode 字符 · 只支持有限字典
                  </p>
                  <div className="examples">
                    {["想探索一下民谣", "少推当前音乐人", "这周少推摇滚"].map(
                      (text) => (
                        <button
                          key={text}
                          onClick={() => {
                            setInput(text);
                            setCandidate(null);
                            setParseState("idle");
                          }}
                        >
                          {text}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    className="primary full"
                    disabled={parseState === "parsing"}
                    onClick={runParse}
                  >
                    {parseState === "parsing" ? "本地解析中…" : "生成候选预览"}
                  </button>
                  {parseState === "parsing" && (
                    <button
                      onClick={() => {
                        abort.current?.abort();
                        activeRequest.current = "";
                        setParseState("cancelled");
                      }}
                    >
                      取消解析
                    </button>
                  )}
                  {["error", "cancelled"].includes(parseState) && (
                    <div role="status" className="notice">
                      <strong>
                        {parseState === "error" ? "出错" : "已取消解析"}
                      </strong>
                      <p>
                        {aiError || "草稿未改变，可以重新解析或改用手动设置。"}
                      </p>
                    </div>
                  )}
                  {candidate && (
                    <div className="candidate">
                      <h3>
                        {candidate.status === "ready"
                          ? "已识别 · 请核对候选"
                          : candidate.status === "needs_clarification"
                            ? "需要确认"
                            : "暂不支持"}
                      </h3>
                      {candidate.status === "ready" ? (
                        <>
                          <p className="helper">
                            原来 → 建议；采用只进入草稿。
                          </p>
                          <label>
                            新鲜程度：{freshLabel(draft.value.freshness)} →
                            <select
                              value={candidate.patch.freshness ?? ""}
                              onChange={(e) =>
                                setCandidate({
                                  ...candidate,
                                  patch: {
                                    ...candidate.patch,
                                    freshness: (e.target.value ||
                                      null) as Freshness | null,
                                  },
                                })
                              }
                            >
                              <option value="">保持不变</option>
                              {(
                                ["familiar", "balanced", "explore"] as const
                              ).map((f) => (
                                <option value={f} key={f}>
                                  {freshLabel(f)}
                                </option>
                              ))}
                            </select>
                          </label>
                          <p>
                            原方向：
                            {draft.value.positiveTagIds
                              .map(tagLabel)
                              .join("、") || "不限方向"}
                          </p>
                          {candidate.patch.positiveTagIds !== null ? (
                            <fieldset>
                              <legend>建议替换方向（可编辑）</legend>
                              <div className="tag-grid">
                                {tags.tags.map((t) => (
                                  <button
                                    key={t.id}
                                    aria-pressed={candidate.patch.positiveTagIds?.some(
                                      (id) => id === t.id,
                                    )}
                                    onClick={() => {
                                      const a =
                                        candidate.patch.positiveTagIds ?? [];
                                      setCandidate({
                                        ...candidate,
                                        patch: {
                                          ...candidate.patch,
                                          positiveTagIds: (a.some(
                                            (id) => id === t.id,
                                          )
                                            ? a.filter((x) => x !== t.id)
                                            : [
                                                ...a,
                                                t.id,
                                              ]) as IntentCandidate["patch"]["positiveTagIds"],
                                        },
                                      });
                                    }}
                                  >
                                    {candidate.patch.positiveTagIds?.some(
                                      (id) => id === t.id,
                                    )
                                      ? "✓ "
                                      : ""}
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </fieldset>
                          ) : (
                            <p>内容方向：保持不变</p>
                          )}
                          <p>
                            少推建议：
                            {candidate.patch.negativeTargets === null
                              ? "保持不变"
                              : candidate.patch.negativeTargets
                                  .map(targetLabel)
                                  .join("、") || "清空当前范围少推"}
                          </p>
                          {candidate.patch.negativeTargets !== null && (
                            <button
                              onClick={() =>
                                setCandidate({
                                  ...candidate,
                                  patch: {
                                    ...candidate.patch,
                                    negativeTargets: null,
                                  },
                                })
                              }
                            >
                              不采用少推建议
                            </button>
                          )}
                          <p>
                            范围建议：
                            {candidate.scopeSuggestion === null
                              ? "未提出"
                              : candidate.scopeSuggestion === "session"
                                ? "仅本次（请手动选择）"
                                : "长期偏好（请手动选择）"}
                            <br />
                            保护建议：
                            {candidate.isolationSuggestion === null
                              ? "未提出"
                              : candidate.isolationSuggestion
                                ? "开启（请手动选择）"
                                : "关闭（请手动选择）"}
                          </p>
                          <p className="helper">
                            未识别内容：无。方向为软偏好；条件不会静默放宽。
                          </p>
                          {!candidateValid(candidate) && (
                            <p role="alert">
                              候选超过上限或存在冲突，请修改后采用。
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p>{candidate.clarificationQuestion}</p>
                          <p>
                            未识别/需确认片段：
                            {candidate.unmappedPhrases.join("、")}
                          </p>
                        </>
                      )}
                      <details>
                        <summary>查看结构化结果</summary>
                        <pre>{JSON.stringify(candidate, null, 2)}</pre>
                      </details>
                    </div>
                  )}
                  <button
                    className="text-button"
                    onClick={() => setPanel("want")}
                  >
                    改用手动设置
                  </button>
                </>
              )}
              {message && (
                <p className="notice" role="alert">
                  {message}
                </p>
              )}
              {message.includes("版本冲突") && (
                <button
                  onClick={() => {
                    edit({
                      baseRevision: state.revision,
                      operationId: crypto.randomUUID(),
                    });
                    setMessage(
                      "已载入当前 revision，草稿保留，请再次核对后确认。",
                    );
                  }}
                >
                  核对当前版本并保留草稿
                </button>
              )}
            </div>
            <footer className="sheet-actions">
              <button onClick={back}>
                {panel === "root"
                  ? "取消"
                  : panel === "manage"
                    ? "关闭"
                    : "返回"}
              </button>
              {panel === "root" || (quick && panel === "negative") ? (
                <button
                  className="primary"
                  disabled={!draftFields.length}
                  onClick={() => submit()}
                >
                  确认调整
                </button>
              ) : panel === "promote" ? (
                <button className="primary" onClick={() => submit(true)}>
                  确认长期保存
                </button>
              ) : panel === "discard" ? (
                <button
                  className="primary"
                  onClick={() => {
                    setDraft(openDraft(state));
                    setPanel("manage");
                  }}
                >
                  放弃草稿并进入
                </button>
              ) : panel === "ai" ? (
                <button
                  className="primary"
                  disabled={
                    candidate?.status !== "ready" || !candidateValid(candidate)
                  }
                  onClick={adoptCandidate}
                >
                  采用到草稿
                </button>
              ) : panel === "manage" ? null : (
                <button className="primary" onClick={() => setPanel("root")}>
                  完成
                </button>
              )}
            </footer>
          </div>
        )}
      </dialog>
    </div>
  );
}
