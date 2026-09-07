import Ajv2020 from "ajv/dist/2020";
import schema from "../../specs/intent.schema.json";
import requestSchema from "../../specs/intent-request.schema.json";
import tags from "../../specs/tags.json";
import {
  config,
  catalog,
  uniqueTargets,
  type Target,
  type Draft,
  changeDraft,
} from "./model";
import type { IntentCandidate } from "../generated/intent-schema";
import type { IntentRequest } from "../generated/intent-request";
export type { IntentCandidate, IntentRequest };
const ajv = new Ajv2020({ allErrors: true, strict: false });
export const schemaValid = ajv.compile<IntentCandidate>(schema);
const requestValid = ajv.compile<IntentRequest>(requestSchema);
export function candidateValid(v: unknown): v is IntentCandidate {
  if (!schemaValid(v)) return false;
  const p = v.patch;
  if (
    v.status === "ready" &&
    Object.values(p).every((x) => x === null) &&
    v.scopeSuggestion === null &&
    v.isolationSuggestion === null
  )
    return false;
  return !(p.negativeTargets ?? []).some((t) =>
    t.kind === "tag"
      ? p.positiveTagIds?.includes(t.id)
      : t.kind === "track"
        ? !catalog.tracks.some((x) => x.id === t.id)
        : !catalog.tracks.some((x) => x.artistId === t.id),
  );
}
const empty = (): IntentCandidate => ({
  status: "ready",
  patch: { freshness: null, positiveTagIds: null, negativeTargets: null },
  scopeSuggestion: null,
  isolationSuggestion: null,
  unmappedPhrases: [],
  clarificationQuestion: null,
});
const stop = (
  status: "needs_clarification" | "unsupported",
  text: string,
  question: string,
): IntentCandidate => ({
  ...empty(),
  status,
  unmappedPhrases: [text.slice(0, 120)],
  clarificationQuestion: question,
});
export function parse(request: IntentRequest): IntentCandidate {
  const text = request.inputText.trim();
  if (
    !text ||
    [...text].length > config.ai.maxInputUnicodeCodePoints ||
    !requestValid({ ...request, inputText: text })
  )
    throw Error("请输入1–200个 Unicode 字符；超长输入不会截断。");
  if (
    /<[^>]*>|忽略.*规则|直接.*(写入|画像)|删除|永远.*(不|别)|黑名单|购买|付费/.test(
      text,
    )
  )
    return stop(
      "unsupported",
      text,
      "暂不支持执行、删除或强屏蔽。少推仍可能出现，请改用手动设置。",
    );
  if (/这周|本周|[一二三四五六七八九十\d]+天|一周|个月/.test(text))
    return stop(
      "needs_clarification",
      text,
      "目前只支持仅本次或长期偏好，请手动选择范围。",
    );
  if (/不要不|不能不|不是不|都不能|只要|必须.*只/.test(text))
    return stop(
      "needs_clarification",
      text,
      "请确认要多听还是少推；标签为软偏好，不能保证完全排除。",
    );
  if (/随便|随意/.test(text) || !/[\p{L}\p{N}]/u.test(text))
    return stop(
      "needs_clarification",
      text,
      "更想听熟悉内容还是探索？请描述具体方向或改用手动设置。",
    );
  const c = empty();
  let remaining = text;
  if (/关闭临时收听/.test(text)) {
    c.isolationSuggestion = false;
    remaining = remaining.replace(/关闭临时收听/g, "");
  } else if (/不[要]?影响长期推荐|开启临时收听|临时保护/.test(text)) {
    c.isolationSuggestion = true;
    remaining = remaining.replace(
      /(?:本次听歌|这次听歌)?不[要]?影响长期推荐|开启临时收听|临时保护/g,
      "",
    );
  }
  if (/以后|长期/.test(remaining)) {
    c.scopeSuggestion = "long_term";
    remaining = remaining.replace(/以后|长期/g, "");
  } else if (/这次|本次|仅本次/.test(remaining)) {
    c.scopeSuggestion = "session";
    remaining = remaining.replace(/仅本次|这次|本次/g, "");
  }
  const fmatches = (["familiar", "balanced", "explore"] as const).filter((f) =>
    remaining.includes(
      { familiar: "熟悉", balanced: "平衡", explore: "探索" }[f],
    ),
  );
  if (fmatches.length > 1)
    return stop(
      "needs_clarification",
      text,
      "请从熟悉、平衡、探索中保留一个方向。",
    );
  c.patch.freshness = fmatches[0] ?? null;
  remaining = remaining.replace(/熟悉|平衡|探索/g, "");
  if (/清空.*(想听|标签)/.test(remaining)) {
    c.patch.positiveTagIds = [];
    remaining = remaining.replace(/清空想听的标签|清空标签/g, "");
  }
  if (/清空.*少推/.test(remaining)) {
    c.patch.negativeTargets = [];
    remaining = remaining.replace(/清空(?:当前范围的)?少推项/g, "");
  }
  const neg: Target[] = [];
  const positive: string[] = [];
  const references: [RegExp, Target | null][] = [
    [
      /少推(?:当前音乐人|当前歌手|这个歌手)/g,
      request.currentArtistId
        ? { kind: "artist", id: request.currentArtistId }
        : null,
    ],
    [
      /少推(?:这首歌|当前歌曲)/g,
      request.currentTrackId
        ? { kind: "track", id: request.currentTrackId }
        : null,
    ],
    [
      /少推当前风格/g,
      request.currentStyleIds.length === 1
        ? ({ kind: "tag", id: request.currentStyleIds[0] } as Target)
        : null,
    ],
  ];
  for (const [pattern, target] of references) {
    if (remaining.match(pattern)) {
      if (!target)
        return stop(
          "needs_clarification",
          text,
          "当前对象不明确，请手动选择要少推的对象。",
        );
      neg.push(target);
      remaining = remaining.replace(pattern, "");
    }
  }
  // Each clause maintains its own explicit positive/negative intent; no sentence lookups.
  const clauses = remaining.split(/[,，。；;]|但也|但是|但/);
  let residual = "";
  for (let clause of clauses) {
    const negative = /少推|不要|不想听|不听/.test(clause);
    for (const tag of tags.tags) {
      const aliases = [...tag.approvedAliases].sort(
        (a, b) => b.length - a.length,
      );
      if (aliases.some((a) => clause.includes(a))) {
        if (negative) neg.push({ kind: "tag", id: tag.id } as Target);
        else positive.push(tag.id);
        for (const a of aliases) clause = clause.replaceAll(a, "");
      }
    }
    residual += clause.replace(
      /新鲜程度|调回|多推荐|多听|想听|推荐|少推|不要|不想听|不听|一下|一点|一些|多一点|的|歌|音乐|听|想|都|要|太|更|点|来|给我|[、\s]/g,
      "",
    );
  }
  if (
    positive.length > config.feedback.maxPositiveTags ||
    uniqueTargets(neg).length > config.feedback.aiNewNegativeTargetsPerOperation
  )
    return stop(
      "needs_clarification",
      text,
      "最多选择3个方向或少推对象，请确认要保留哪些。",
    );
  if (neg.some((t) => t.kind === "tag" && positive.includes(t.id)))
    return stop(
      "needs_clarification",
      text,
      "同一方向同时想听与少推，请确认要保留哪一个。",
    );
  if (residual)
    return stop(
      "unsupported",
      residual,
      "这部分没有可靠字典或上下文对应，请选择现有标签或改用手动设置。",
    );
  if (positive.length)
    c.patch.positiveTagIds = [
      ...new Set(positive),
    ] as IntentCandidate["patch"]["positiveTagIds"];
  if (neg.length) c.patch.negativeTargets = uniqueTargets(neg);
  if (!candidateValid(c))
    return stop(
      "needs_clarification",
      text,
      "尚未识别到有效修改，请描述具体音乐方向或改用手动设置。",
    );
  return c;
}
export function adopt(d: Draft, c: IntentCandidate): Draft {
  if (c.status !== "ready" || !candidateValid(c)) throw Error("候选不可采用");
  const next = changeDraft(d, {});
  if (c.patch.freshness !== null) next.value.freshness = c.patch.freshness;
  if (c.patch.positiveTagIds !== null)
    next.value.positiveTagIds = [...c.patch.positiveTagIds];
  if (c.patch.negativeTargets !== null)
    next.negativePatch = c.patch.negativeTargets;
  return next; // Scope and protection suggestions intentionally require manual choice.
}
export type Envelope = {
  requestId: string;
  draftRevision: number;
  adapterMode: string;
  transportStatus: "ok" | "error" | "cancelled";
  candidate: IntentCandidate | null;
  errorCode?: string;
};
export interface Adapter {
  parse(request: IntentRequest, signal?: AbortSignal): Promise<Envelope>;
}
export class LocalRuleAdapter implements Adapter {
  async parse(r: IntentRequest, signal?: AbortSignal): Promise<Envelope> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    if (signal?.aborted)
      return {
        requestId: r.requestId,
        draftRevision: r.draftRevision,
        adapterMode: config.ai.adapterDefault,
        transportStatus: "cancelled",
        candidate: null,
      };
    try {
      return {
        requestId: r.requestId,
        draftRevision: r.draftRevision,
        adapterMode: config.ai.adapterDefault,
        transportStatus: "ok",
        candidate: parse(r),
      };
    } catch (error) {
      return {
        requestId: r.requestId,
        draftRevision: r.draftRevision,
        adapterMode: config.ai.adapterDefault,
        transportStatus: "error",
        candidate: null,
        errorCode: String(error),
      };
    }
  }
}
export class RealProviderAdapter implements Adapter {
  async parse(r: IntentRequest): Promise<Envelope> {
    return {
      requestId: r.requestId,
      draftRevision: r.draftRevision,
      adapterMode: "disabled",
      transportStatus: "error",
      candidate: null,
      errorCode: "REAL_PROVIDER_DISABLED",
    };
  }
}
export const currentEnvelope = (
  e: Envelope,
  requestId: string,
  draftRevision: number,
) =>
  e.requestId === requestId &&
  e.draftRevision === draftRevision &&
  e.transportStatus === "ok";
