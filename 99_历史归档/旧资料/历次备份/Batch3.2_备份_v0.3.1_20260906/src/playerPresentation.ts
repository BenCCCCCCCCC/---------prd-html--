import { catalog, type Target, type Track } from "./domain/model";
import tags from "../specs/tags.json";
const assets = import.meta.glob<string>("./assets/player/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
export const playerAsset = (name: string) =>
  assets[`./assets/player/${name}.png`];
export const playerAssetUrls = Object.values(assets);
// Display aliases only. IDs, tags, weights, durations and parser context stay canonical.
export const displayTrack = (track: Track) => ({
  title: track.id === "T01" ? "牵丝戏" : track.title.replace("（演示）", ""),
  artist:
    track.artistId === catalog.tracks[0].artistId
      ? "Aki阿杰 / 银临"
      : track.artistName,
  cover: playerAsset(
    track.id === "T01"
      ? "cover"
      : track.coverAssetId.replace("geometric-", "cover-"),
  ),
});
export const displayTarget = (target: Target) => {
  if (target.kind === "tag")
    return tags.tags.find((t) => t.id === target.id)?.label ?? target.id;
  const track = catalog.tracks.find((t) =>
    target.kind === "track" ? t.id === target.id : t.artistId === target.id,
  );
  return track
    ? target.kind === "track"
      ? displayTrack(track).title
      : displayTrack(track).artist
    : target.id;
};
