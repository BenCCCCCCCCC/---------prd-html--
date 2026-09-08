import type { ReactNode } from "react";
import tags from "../specs/tags.json";
import { catalog, type Target, type Freshness } from "./domain/model";
export const tagLabel = (id: string) =>
  tags.tags.find((t) => t.id === id)?.label ?? id;
export const freshLabel = (f: Freshness) =>
  ({ familiar: "熟悉", balanced: "平衡", explore: "探索" })[f];
export const targetLabel = (t: Target) =>
  t.kind === "tag"
    ? tagLabel(t.id)
    : t.kind === "artist"
      ? catalog.tracks.find((x) => x.artistId === t.id)?.artistName
      : catalog.tracks.find((x) => x.id === t.id)?.title;
export function Icon({
  name,
}: {
  name:
    | "play"
    | "pause"
    | "next"
    | "heart"
    | "sliders"
    | "arrow"
    | "shield"
    | "close";
}) {
  const paths = {
    play: "m9 5 11 7-11 7Z",
    pause: "M8 5v14M16 5v14",
    next: "m5 5 11 7-11 7ZM19 5v14",
    heart: "M12 20S2 14 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 6-10 12-10 12Z",
    sliders: "M4 7h16M4 17h16M8 4v6M16 14v6",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    shield: "m12 2 8 4v7c0 5-8 9-8 9s-8-4-8-9V6Zm-4 10 3 3 5-6",
    close: "m6 6 12 12M6 18 18 6",
  };
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
export function Cover({ small = false }: { small?: boolean }) {
  return (
    <svg
      className={small ? "cover small" : "cover"}
      viewBox="0 0 160 160"
      role="img"
      aria-label="虚构几何封面：沿河慢行"
    >
      <rect width="160" height="160" fill="var(--selectedSoft)" />
      <circle cx="122" cy="38" r="28" fill="var(--primary)" />
      <path d="M0 118 66 38 130 160H0Z" fill="var(--selectedText)" />
      <path d="M34 160Q52 103 94 96T160 56V160Z" fill="var(--primary)" />
      <path
        d="M63 160Q85 112 117 107T160 84"
        stroke="var(--surface)"
        strokeWidth="8"
        fill="none"
      />
    </svg>
  );
}
export function Section({
  id,
  no,
  title,
  children,
}: {
  id: string;
  no: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="case-section">
      <div className="section-label">{no} / PRODUCT REASONING</div>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
