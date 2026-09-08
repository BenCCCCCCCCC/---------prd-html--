import { useId, useRef, useState } from "react";
import tags from "../specs/tags.json";
import { freshLabel } from "./components";
import type { Freshness } from "./domain/model";

export function FreshnessControl({
  value,
  onChange,
  name = "freshness",
}: {
  value: Freshness | null;
  onChange: (value: Freshness) => void;
  name?: string;
}) {
  return (
    <fieldset className="freshness-field">
      <legend>新鲜程度</legend>
      <div className="segmented">
        {(["familiar", "balanced", "explore"] as const).map((f) => (
          <label key={f} className={value === f ? "selected" : ""}>
            <input
              type="radio"
              name={name}
              value={f}
              checked={value === f}
              onChange={() => onChange(f)}
            />
            <span>{freshLabel(f)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TagPicker({
  selected,
  onToggle,
  label = "内容方向分类",
}: {
  selected: readonly string[];
  onToggle: (id: string) => void;
  label?: string;
}) {
  const categories = [...new Set(tags.tags.map((t) => t.category))];
  const [active, setActive] = useState(categories[0]);
  const id = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="tag-picker">
      <div role="tablist" aria-label={label} className="category-tabs">
        {categories.map((category, index) => (
          <button
            key={category}
            ref={(el) => {
              tabs.current[index] = el;
            }}
            id={`${id}-tab-${index}`}
            role="tab"
            aria-selected={active === category}
            aria-controls={`${id}-panel`}
            tabIndex={active === category ? 0 : -1}
            onClick={() => setActive(category)}
            onKeyDown={(e) => {
              const next =
                e.key === "ArrowRight"
                  ? (index + 1) % categories.length
                  : e.key === "ArrowLeft"
                    ? (index + categories.length - 1) % categories.length
                    : e.key === "Home"
                      ? 0
                      : e.key === "End"
                        ? categories.length - 1
                        : null;
              if (next !== null) {
                e.preventDefault();
                setActive(categories[next]);
                tabs.current[next]?.focus();
              }
            }}
          >
            {category}
          </button>
        ))}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${categories.indexOf(active)}`}
        className="tag-grid"
      >
        {tags.tags
          .filter((t) => t.category === active)
          .map((t) => (
            <button
              key={t.id}
              aria-pressed={selected.includes(t.id)}
              onClick={() => onToggle(t.id)}
            >
              <span aria-hidden="true">
                {selected.includes(t.id) ? "✓ " : ""}
              </span>
              {t.label}
            </button>
          ))}
      </div>
      <p className="selected-tags helper" aria-live="polite">
        已选：
        {selected.length
          ? tags.tags
              .filter((t) => selected.includes(t.id))
              .map((t) => t.label)
              .join("、")
          : "暂无"}
      </p>
    </div>
  );
}
