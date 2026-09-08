import { useLayoutEffect, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import input from "../finalization_input/specs/annotations.json";
import type { Draft, State } from "./domain/model";
const panelIds: Record<string, string> = {
  root: "N02",
  want: "N03",
  negative: "N04",
  impact: "N05",
  manage: "N07",
  promote: "N07",
  discard: "N07",
  ai: "N10",
};
const targets: Record<string, string> = {
  "adjust-entry": ".adjust-entry",
  "player-context": ".record-stage",
  "scope-summary": ".current-state summary",
  "want-row": '[data-panel="want"]',
  "negative-row": '[data-panel="negative"]',
  "impact-row": '[data-panel="impact"]',
  cancel: ".sheet-actions button",
  confirm: ".sheet-actions button:last-child",
  freshness: ".segmented",
  "tag-tabs": ".category-tabs",
  "tag-chips": ".tag-grid",
  done: ".sheet-actions button:last-child",
  "negative-targets": "fieldset",
  "blacklist-note": ".blacklist",
  "negative-confirm": ".sheet-actions",
  "scope-radio": ".radio-row",
  "protection-switch": ".switch-row",
  "promote-confirmation": ".promote-choice",
  "impact-done": ".sheet-actions",
  "protection-status": ".protection-bar",
  "review-reminder": ".reminder",
  "protection-close": ".reminder .actions",
  "manage-list": ".sheet-body",
  "manage-clear": ".sheet-body button",
  "discard-prompt": ".sheet-body",
  receipt: ".product-feedback",
  undo: ".feedback-actions",
  "persistent-undo": ".current-state summary",
  "receipt-terminal": ".feedback-copy",
  "failed-save-state": ".feedback-copy",
  "failed-protection": ".feedback-copy p",
  "failed-actions": ".feedback-actions",
  "ai-parser": "textarea",
  "candidate-fields": ".candidate-diff",
  "scope-suggestion": ".candidate",
  adopt: ".sheet-actions",
};
export default function Annotations({
  state,
  draft,
  panel,
  hasReceipt,
  root,
  modal = false,
  onHide,
  diagnostic,
  receiptStatus,
}: {
  state: State;
  draft: Draft | null;
  panel: string;
  hasReceipt: boolean;
  root: RefObject<HTMLElement | null>;
  modal?: boolean;
  onHide: () => void;
  diagnostic?: unknown;
  receiptStatus?: "saved" | "undone" | "error";
}) {
  const id = draft
    ? panelIds[panel]
    : state.refreshStatus === "failed"
      ? "N09"
      : hasReceipt
        ? "N08"
        : state.protection !== "off"
          ? "N06"
          : "N01";
  const note = input.annotations.find((n) => n.id === id)!;
  const [marks, setMarks] = useState<
    { number: number; x: number; y: number }[]
  >([]);
  useLayoutEffect(() => {
    const place = () =>
      setMarks(
        note.points.flatMap((p) => {
          const node = root.current?.querySelector<HTMLElement>(
            targets[p.target],
          );
          if (!node) return [];
          const r = node.getBoundingClientRect();
          if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight)
            return [];
          return [
            {
              number: p.number,
              x: Math.max(2, r.left - 17),
              y: Math.max(4, r.top + 4),
            },
          ];
        }),
      );
    place();
    const observer = new ResizeObserver(place);
    if (root.current) observer.observe(root.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [note, root, draft, state.protection, state.refreshStatus, hasReceipt]);
  return (
    <aside
      className={`development-annotations ${modal ? "modal-annotations" : ""}`}
      aria-label="研发规则标注"
    >
      <details open={!modal || window.innerWidth >= 1100}>
        <summary>研发规则标注 · {note.title}</summary>
        <p className="annotation-state">
          {draft
            ? `当前：${panel === "root" ? "总面板草稿" : note.title}`
            : note.title}{" "}
          ·{" "}
          {draft
            ? draft.scope === "session"
              ? "仅本次"
              : "长期偏好"
            : "当前有效状态"}{" "}
          · 保护
          {state.protection === "off"
            ? "关闭"
            : state.protection === "active"
              ? "开启"
              : "待确认"}
          {draft &&
            ` · 保护草稿：${draft.protection ? "开启" : "关闭"}（尚未生效）`}
        </p>
        {receiptStatus && !draft && (
          <p className="annotation-state">
            当前回执：
            {receiptStatus === "saved"
              ? "已保存"
              : receiptStatus === "undone"
                ? "已撤销"
                : "失败或冲突"}
          </p>
        )}
        <ol>
          {note.points.map((p) => (
            <li key={p.number} value={p.number}>
              {p.text}
            </li>
          ))}
        </ol>
        <p className="annotation-acceptance">
          验收：{note.acceptance.join("、")}
        </p>
        <p className="annotation-context">
          循环、上一首、评论、音质、设备、音效与信息图标为参考上下文，不在本期改动范围。当前保护
          {state.protection === "off"
            ? "关闭；普通收听可参与长期推荐。"
            : "保持隔离，以产品内实际状态为准。"}
        </p>
        <Link to={`/?section=${note.sourceSection}`}>返回对应章节</Link>
        {modal && <button onClick={onHide}>隐藏标注</button>}
        {!!diagnostic && (
          <details className="annotation-diagnostic">
            <summary>测试工具 · 候选 JSON</summary>
            <pre>{JSON.stringify(diagnostic, null, 2)}</pre>
          </details>
        )}
      </details>
      <div aria-hidden="true" className="annotation-markers">
        {marks.map((m) => (
          <span key={m.number} style={{ left: m.x, top: m.y }}>
            {m.number}
          </span>
        ))}
      </div>
    </aside>
  );
}
