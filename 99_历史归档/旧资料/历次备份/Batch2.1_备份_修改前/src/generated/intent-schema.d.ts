/* Generated from canonical schema. Do not edit. */

export type IntentCandidate = {
  status: "ready" | "needs_clarification" | "unsupported";
  patch: {
    freshness: ("familiar" | "balanced" | "explore") | null;
    positiveTagIds:
      | (
          | "genre_folk"
          | "genre_pop"
          | "genre_rock"
          | "genre_classical"
          | "mood_calm"
          | "mood_sad"
          | "mood_energetic"
          | "scene_study"
          | "scene_exercise"
          | "lang_zh"
          | "lang_en"
          | "theme_instrumental"
        )[]
      | null;
    negativeTargets:
      | (
          | {
              kind: "track";
              id: string;
            }
          | {
              kind: "artist";
              id: string;
            }
          | {
              kind: "tag";
              id:
                | "genre_folk"
                | "genre_pop"
                | "genre_rock"
                | "genre_classical"
                | "mood_calm"
                | "mood_sad"
                | "mood_energetic"
                | "scene_study"
                | "scene_exercise"
                | "lang_zh"
                | "lang_en"
                | "theme_instrumental";
            }
        )[]
      | null;
  };
  scopeSuggestion: ("session" | "long_term") | null;
  isolationSuggestion: boolean | null;
  /**
   * @maxItems 8
   */
  unmappedPhrases: string[];
  clarificationQuestion: string | null;
};
