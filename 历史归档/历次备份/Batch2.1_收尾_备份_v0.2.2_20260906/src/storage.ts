import { advance, config, initial, type State } from "./domain/model";
export const storageKey = config.browserDemo.namespace;
export function restore(storage: Storage, now = Date.now()): State {
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return initial(now);
    const s = JSON.parse(raw) as State;
    if (
      s.schemaVersion !== config.schemaVersion ||
      !s.persistent ||
      !s.session ||
      !Array.isArray(s.logs) ||
      !["off", "active", "review_required"].includes(s.protection) ||
      !Number.isFinite(s.now)
    )
      return initial(now);
    s.playing = false;
    s.segmentStart = null;
    s.playedSeconds = Number.isFinite(s.playedSeconds) ? s.playedSeconds : 0;
    return advance(s, Math.max(0, now - s.now));
  } catch {
    return initial(now);
  }
}
export function save(storage: Storage, state: State) {
  storage.setItem(storageKey, JSON.stringify(state));
}
export function resetStorage(storage: Storage) {
  storage.removeItem(storageKey);
}
