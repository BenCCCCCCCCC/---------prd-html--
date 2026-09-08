import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FreshnessControl, TagPicker } from "./PreferenceControls";
import { ProductFeedback } from "./ProductFeedback";
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
} from "./domain/model";
import {
  adopt,
  candidateValid,
  currentEnvelope,
  LocalRuleAdapter,
  type IntentCandidate,
} from "./domain/ai";
import { Icon, tagLabel, freshLabel } from "./components";
import ReferencePlayer, { ReferenceCover } from "./ReferencePlayer";
import {
  displayTrack,
  displayTarget as targetLabel,
} from "./playerPresentation";
import Annotations from "./Annotations";
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
export default function Demo({
  preview = false,
  active = true,
  returnTo = "/",
}: {
  preview?: boolean;
  active?: boolean;
  returnTo?: string;
}) {
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
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [queueOpen, setQueueOpen] = useState(false);
  const [notes, setNotes] = useState(false);
  const [failure, setFailure] = useState("none");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState<{
    operationId: string;
    status: "saved" | "undone" | "error";
    text: string;
    detail: string;
    expiresAt: number;
  } | null>(null);
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
  const product = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchY = useRef<number | null>(null);
  const ownsHistoryEntry = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  useEffect(() => {
    if (!active) return;
    const previous = history.scrollRestoration;
    // Synthetic modal history must not replay an old page scroll on commit/cancel.
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = previous;
    };
  }, [active]);
  useLayoutEffect(() => {
    if (!active) {
      // Reading hides the modal, retaining its draft and the running session.
      dialog.current?.close();
      ownsHistoryEntry.current = false;
      abort.current?.abort();
      activeRequest.current = "";
      setInput("");
      setCandidate(null);
      setParseState("idle");
      setAiError("");
    }
  }, [active]);
  useEffect(() => {
    const handleBack = () => {
      if (
        !preview &&
        (!activeRef.current || !window.location.hash.startsWith("#/demo"))
      )
        return;
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
    const timer = setTimeout(
      () => setReceipt(null),
      Math.max(0, receipt.expiresAt - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [receipt]);
  useEffect(() => {
    if (active && draft && !dialog.current?.open) dialog.current?.showModal();
  }, [draft, active]);
  useEffect(() => {
    if (!draft || !active) return;
    const align = () => {
      const bounds = product.current?.getBoundingClientRect();
      if (bounds && dialog.current) {
        dialog.current.style.left = `${bounds.left}px`;
        dialog.current.style.width = `${bounds.width}px`;
        dialog.current.style.bottom = `${bounds.bottom >= window.innerHeight * 0.9 ? Math.max(0, window.innerHeight - bounds.bottom) : 0}px`;
        dialog.current.style.setProperty(
          "--annotation-left",
          `${bounds.right + 48}px`,
        );
      }
    };
    align();
    window.addEventListener("resize", align);
    return () => window.removeEventListener("resize", align);
  }, [draft, active]);
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
      preview ? ".demo-preview .adjust-entry" : ".demo-page .adjust-entry",
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
    opener.current?.focus({ preventScroll: true });
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
    setReceipt({
      operationId: draft.operationId,
      status: "saved",
      text: `${draft.scope === "session" ? "仅本次" : "长期偏好"}已保存`,
      detail: fields
        .map(
          (f) =>
            ({
              freshness: freshLabel(draft.value.freshness),
              positiveTagIds:
                draft.value.positiveTagIds.map(tagLabel).join("、") ||
                "清空方向",
              negativeTargets:
                "少推 " +
                (draft.negativePatch ?? []).map(targetLabel).join("、") +
                "，仍可能出现",
              protection: draft.protection ? "开启临时保护" : "关闭临时保护",
            })[f],
        )
        .join(" / "),
      expiresAt: Date.now() + config.measurement.toastMs,
    });
    close();
  }
  function doUndo(id: string | undefined) {
    if (!id) return;
    const r = undo(stateRef.current, id);
    setMessage(draft ? (r.error ?? "已撤销本轮调整。") : "");
    if (!r.error) {
      update(refresh(r.state));
    }
    setReceipt({
      operationId: id,
      status: r.error ? "error" : "undone",
      text: r.error ?? "已撤销本轮调整。",
      detail: "",
      expiresAt:
        receipt?.operationId === id
          ? receipt.expiresAt
          : Date.now() + config.measurement.toastMs,
    });
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
          <Link to={returnTo}>
            {returnTo === "/" ? "← 返回完整 PRD" : "← 返回本节"}
          </Link>
          <h1>交互原型</h1>
          <button aria-expanded={notes} onClick={() => setNotes(!notes)}>
            测试工具 · {notes ? "收起" : "展开"}
          </button>
          <label className="annotation-toggle">
            <input
              type="checkbox"
              checked={showAnnotations}
              onChange={(e) => setShowAnnotations(e.target.checked)}
            />
            显示标注
          </label>
          {state.aiEnabled && (
            <button onClick={() => open("ai")}>AI 实验 · 本地解析</button>
          )}
        </header>
      )}
      <div className="demo-layout" role={preview ? undefined : "main"}>
        <div
          ref={product}
          className={`product reference-product ${queueOpen ? "queue-product" : "full-player"}`}
          data-testid="product"
          aria-label="产品画布"
        >
          {queueOpen && (
            <div className="product-top">
              <button onClick={() => setQueueOpen(false)}>返回播放器</button>
            </div>
          )}
          {state.protection !== "off" && (
            <div className={"protection-bar on"}>
              <Icon name="shield" />
              <span>{protectedText}</span>
            </div>
          )}
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
            <ReferencePlayer
              track={track}
              state={state}
              onOpen={(quick) => open(quick ? "negative" : "root", !!quick)}
              onQueue={() => setQueueOpen(true)}
              onHeart={() => update(playback(state, "heart"))}
              onToggle={() => update(playback(state, "toggle"))}
              onNext={() => update(playback(state, "next"))}
            />
          ) : (
            <div className="queue">
              <div className="queue-title">
                <h2>推荐队列</h2>
                <button onClick={() => open()}>调整本次推荐偏好</button>
              </div>
              <p className="helper">排序只作用于自动推荐，当前歌不被打断。</p>
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
                      <ReferenceCover track={t} small />
                      <div>
                        <strong>{displayTrack(t).title}</strong>
                        <p>
                          {displayTrack(t).artist} ·{" "}
                          {t.tagIds.slice(0, 2).map(tagLabel).join(" / ")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
          {!draft && (receipt || state.refreshStatus === "failed") && (
            <ProductFeedback product={product}>
              <div
                className="feedback-copy notice receipt"
                role="status"
                tabIndex={0}
              >
                {state.refreshStatus === "failed" && (
                  <strong>设置已保存，推荐尚未刷新。</strong>
                )}
                {receipt &&
                  (state.refreshStatus !== "failed" ||
                    receipt.status !== "saved") && (
                    <>
                      <strong>{receipt.text}</strong>
                      {receipt.detail && <p>{receipt.detail}</p>}
                    </>
                  )}
                <p>{protectedText}</p>
              </div>
              <div className="feedback-actions">
                {receipt?.status === "saved" && (
                  <button onClick={() => doUndo(receipt.operationId)}>
                    撤销
                  </button>
                )}
                {state.refreshStatus === "failed" && (
                  <>
                    <button
                      aria-label="重试刷新"
                      onClick={() => update(refresh(stateRef.current))}
                    >
                      重试
                    </button>
                    <button
                      aria-label="继续听歌"
                      onClick={() => setQueueOpen(false)}
                    >
                      继续
                    </button>
                  </>
                )}
              </div>
            </ProductFeedback>
          )}
          {!draft && message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          {!preview && (
            <div className="current-state">
              <details>
                <summary>当前调整与恢复</summary>
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
                  <button
                    disabled={
                      !last?.afterPatch ||
                      last.dirtyFields.some(
                        (f) =>
                          state.fieldVersions[f] !== last.fieldVersions?.[f],
                      )
                    }
                    onClick={() => doUndo(last?.operationId)}
                  >
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
          {queueOpen && (
            <div className="mini-player">
              <ReferenceCover track={track} small />
              <div>
                <strong>{displayTrack(track).title}</strong>
                <span>
                  {state.protection === "off"
                    ? "普通收听可参与长期推荐"
                    : "保护持续 · 普通收听不参与长期推荐"}
                </span>
              </div>
              <Icon name={state.protection === "off" ? "play" : "shield"} />
            </div>
          )}
        </div>
        {!preview && (
          <aside className="product-notes">
            {notes && (
              <div className="testing-tools">
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
                <button
                  onClick={() => {
                    resetStorage(sessionStorage);
                    update(initial());
                    setMessage("演示已重置，仅清理项目命名空间。");
                    setReceipt(null);
                  }}
                >
                  重置演示
                </button>
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
                <div className="notes-content">
                  <details>
                    <summary>版本与操作 · 技术 JSON</summary>
                    <pre>
                      {JSON.stringify(
                        {
                          revision: state.revision,
                          queueRevision: state.queueRevision,
                          receipt,
                          lastOperation: last,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                  <p>演示公式，不是网易云真实算法。全部事件只留在本地。</p>

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
                        setMessage("旧响应已丢弃，当前队列与设置未改变。");
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
              </div>
            )}
            {!draft && showAnnotations && (
              <Annotations
                state={state}
                draft={null}
                panel={panel}
                hasReceipt={!!receipt}
                receiptStatus={receipt?.status}
                diagnostic={candidate}
                root={product}
                onHide={() => setShowAnnotations(false)}
              />
            )}
            {storageWarning && (
              <p role="status">存储不可用，当前为内存模式；刷新后将重置。</p>
            )}
          </aside>
        )}
      </div>
      <dialog
        ref={dialog}
        className={`sheet sheet-${panel} submission-sheet`}
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
        {draft && showAnnotations && !preview && (
          <Annotations
            state={state}
            draft={draft}
            panel={panel}
            hasReceipt={!!receipt}
            root={dialog}
            diagnostic={candidate}
            modal
            onHide={() => setShowAnnotations(false)}
          />
        )}
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
                    root: "调整推荐偏好",
                    want: "本次想听",
                    negative: "不想听",
                    impact: "这次偏好调整影响多久？",
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
              <p className="simulation-label fixed-label">本地解析</p>
            )}
            <div className="sheet-body">
              {panel === "root" && (
                <>
                  {!!draftFields.length && (
                    <p className="helper draft-status">草稿待确认</p>
                  )}
                  {rootRows.map(([title, summary, next]) => (
                    <button
                      className="sheet-row"
                      data-panel={next}
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
                  <FreshnessControl
                    value={draft.value.freshness}
                    onChange={(freshness) =>
                      edit({ value: { ...draft.value, freshness } })
                    }
                  />
                  <div className="subheading">
                    <h3>内容方向</h3>
                    <span>
                      {draft.value.positiveTagIds.length} /{" "}
                      {config.feedback.maxPositiveTags}
                    </span>
                  </div>
                  <TagPicker
                    selected={draft.value.positiveTagIds}
                    onToggle={toggleTag}
                  />
                  <button
                    className="text-button"
                    onClick={() =>
                      edit({ value: { ...draft.value, positiveTagIds: [] } })
                    }
                  >
                    清空想听的标签
                  </button>
                  <details className="preference-explanation">
                    <summary>设置说明</summary>
                    <p className="helper">
                      熟悉已知方向，或探索新内容；不等于随机。
                    </p>
                    <p className="helper">
                      方向是软偏好，不保证只出现选中标签。
                    </p>
                  </details>
                </>
              )}
              {panel === "negative" && (
                <>
                  <p>
                    会减少出现机会，<strong>仍可能遇到。</strong>
                  </p>
                  <p className="helper">
                    对象绑定打开时的歌曲：{displayTrack(draft.track).title}
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
                    <label className="switch-row">
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
                  <details className="impact-summary">
                    <summary>本轮选择说明</summary>
                    <p>
                      {draft.scope === "session"
                        ? "显式设置仅本次保存。"
                        : "本轮明确选择会长期保存。"}
                      {draft.protection
                        ? "普通收听受到保护。"
                        : "普通收听仍可能影响长期推荐。"}
                    </p>
                    <small>开关只改草稿，确认调整后才生效。</small>
                  </details>
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
                  <button
                    disabled={
                      !last?.afterPatch ||
                      last.dirtyFields.some(
                        (f) =>
                          state.fieldVersions[f] !== last.fieldVersions?.[f],
                      )
                    }
                    onClick={() => doUndo(last?.operationId)}
                  >
                    撤销上次调整
                  </button>
                </>
              )}
              {panel === "ai" && (
                <>
                  <p className="helper">
                    当前对象：{displayTrack(draft.track).title} ·{" "}
                    {displayTrack(draft.track).artist}
                  </p>
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
                          <div className="candidate-diff">
                            <p>
                              新鲜程度：{freshLabel(draft.value.freshness)} →{" "}
                              {candidate.patch.freshness === null
                                ? "未提及，保持不变"
                                : candidate.patch.freshness ===
                                    draft.value.freshness
                                  ? "与当前设置一致"
                                  : freshLabel(candidate.patch.freshness)}
                            </p>
                            <p>
                              内容方向：
                              {draft.value.positiveTagIds
                                .map(tagLabel)
                                .join("、") || "不限方向"}{" "}
                              →{" "}
                              {candidate.patch.positiveTagIds === null
                                ? "未提及，保持不变"
                                : candidate.patch.positiveTagIds.length ===
                                      draft.value.positiveTagIds.length &&
                                    candidate.patch.positiveTagIds.every((id) =>
                                      draft.value.positiveTagIds.includes(id),
                                    )
                                  ? "与当前设置一致"
                                  : candidate.patch.positiveTagIds
                                      .map(tagLabel)
                                      .join("、") || "明确清空"}
                            </p>
                            <small>采用只进入草稿，最终确认后才生效。</small>
                          </div>
                          <FreshnessControl
                            name="candidate-freshness"
                            value={candidate.patch.freshness}
                            onChange={(freshness) =>
                              setCandidate({
                                ...candidate,
                                patch: { ...candidate.patch, freshness },
                              })
                            }
                          />
                          <button
                            className="text-button"
                            onClick={() =>
                              setCandidate({
                                ...candidate,
                                patch: { ...candidate.patch, freshness: null },
                              })
                            }
                          >
                            新鲜程度保持不变
                          </button>
                          {candidate.patch.positiveTagIds !== null ? (
                            <fieldset>
                              <legend>
                                建议替换方向（可编辑） ·{" "}
                                {candidate.patch.positiveTagIds.length} /{" "}
                                {config.feedback.maxPositiveTags}
                              </legend>
                              <TagPicker
                                label="候选内容方向分类"
                                selected={candidate.patch.positiveTagIds}
                                onToggle={(id) => {
                                  const a =
                                    candidate.patch.positiveTagIds ?? [];
                                  setCandidate({
                                    ...candidate,
                                    patch: {
                                      ...candidate.patch,
                                      positiveTagIds: (a.some(
                                        (value) => value === id,
                                      )
                                        ? a.filter((x) => x !== id)
                                        : [
                                            ...a,
                                            id,
                                          ]) as IntentCandidate["patch"]["positiveTagIds"],
                                    },
                                  });
                                }}
                              />
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
                    setMessage("已载入当前设置，草稿保留，请再次核对后确认。");
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
