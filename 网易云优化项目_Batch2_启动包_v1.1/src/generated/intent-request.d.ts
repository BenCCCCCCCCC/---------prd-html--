/* Generated from canonical request schema. */

export interface IntentRequest {
  requestId: string;
  draftRevision: number;
  inputText: string;
  currentTrackId: string | null;
  currentArtistId: string | null;
  /**
   * @maxItems 3
   */
  currentStyleIds: ("genre_folk" | "genre_pop" | "genre_rock" | "genre_classical")[];
}
