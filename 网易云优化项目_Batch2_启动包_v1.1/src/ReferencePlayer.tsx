import type { State, Track } from "./domain/model";
import { displayTrack, playerAsset } from "./playerPresentation";
import { Icon } from "./components";

export function ReferenceCover({
  track,
  small = false,
}: {
  track: Track;
  small?: boolean;
}) {
  const view = displayTrack(track);
  return (
    <img
      className={small ? "cover small" : "cover"}
      src={view.cover}
      alt={`${view.title}封面`}
    />
  );
}
function Glyph({ name }: { name: string }) {
  return <img src={playerAsset(name)} alt="" aria-hidden="true" />;
}
function Context({ name, label }: { name: string; label: string }) {
  return (
    <span
      className="reference-context"
      role="img"
      aria-label={`${label}，不在本期改动范围`}
      title="不在本期改动范围"
    >
      <Glyph name={name} />
    </span>
  );
}
export default function ReferencePlayer({
  track,
  state,
  onOpen,
  onQueue,
  onHeart,
  onToggle,
  onNext,
}: {
  track: Track;
  state: State;
  onOpen: (quick?: boolean) => void;
  onQueue: () => void;
  onHeart: () => void;
  onToggle: () => void;
  onNext: () => void;
}) {
  const view = displayTrack(track);
  const seconds = Math.min(
    track.durationSeconds,
    Math.floor(state.playedSeconds),
  );
  const time = (n: number) =>
    `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  return (
    <div className="reference-player" data-track-id={track.id}>
      <img
        className="reference-status"
        src={playerAsset("status")}
        alt="参考状态栏：10:22，电量85%"
      />
      <div className="reference-header product-top">
        <button aria-label="推荐队列" onClick={onQueue}>
          <Glyph name="back" />
        </button>
        <span>每日推荐</span>
        <Context name="refresh" label="每日推荐刷新图标" />
      </div>
      <div className="record-stage" data-annotation-target="player-context">
        <img
          className="reference-stage"
          src={playerAsset("stage")}
          alt="唱片与唱臂"
        />
        <div className="reference-cover">
          <ReferenceCover track={track} />
        </div>
      </div>
      <div className="reference-entry-row">
        <img
          className="reference-count"
          src={playerAsset("count")}
          alt="参考画面收听计数689人"
        />
        <button
          className="adjust-entry"
          data-annotation-target="adjust-entry"
          onClick={() => onOpen()}
        >
          <span>
            调整本次推荐偏好 <span aria-hidden="true">›</span>
          </span>
        </button>
      </div>
      <div className="track-heading">
        <div>
          <h2>{view.title}</h2>
          <p>
            {view.artist} <span aria-hidden="true">›</span>
          </p>
        </div>
        <button
          className="icon-button reference-heart"
          aria-label={`收藏当前歌曲：${view.title}`}
          aria-pressed={state.likes.includes(track.id)}
          onClick={onHeart}
        >
          <Glyph name="heart" />
          {state.likes.includes(track.id) && (
            <span className="heart-selected" aria-hidden="true">
              ♥
            </span>
          )}
        </button>
        <Context name="comment" label="评论" />
      </div>
      <div className="reference-progress">
        <div
          className="progress-line"
          role="progressbar"
          aria-label="模拟播放进度"
          aria-valuemin={0}
          aria-valuemax={track.durationSeconds}
          aria-valuenow={seconds}
        >
          <span
            style={{ width: `${(seconds / track.durationSeconds) * 100}%` }}
          />
        </div>
        <div className="time-row">
          <span>{time(seconds)}</span>
          <span>极高音质</span>
          <span>{time(track.durationSeconds)}</span>
        </div>
      </div>
      <div className="play-controls">
        <Context name="loop" label="循环模式" />
        <Context name="previous" label="上一首" />
        <button
          className="play-button"
          aria-label={state.playing ? "暂停模拟" : "播放模拟"}
          onClick={onToggle}
        >
          {state.playing ? <Glyph name="pause" /> : <Icon name="play" />}
        </button>
        <button aria-label="下一首模拟歌曲" onClick={onNext}>
          <Glyph name="next" />
        </button>
        <button aria-label="打开推荐队列" onClick={onQueue}>
          <Glyph name="queue" />
        </button>
      </div>
      <div className="reference-tools">
        <Context name="device" label="设备" />
        <Context name="bulb" label="音效" />
        <Context name="info" label="歌曲信息" />
        <button aria-label="更多：快捷少推" onClick={() => onOpen(true)}>
          <Glyph name="more" />
        </button>
      </div>
    </div>
  );
}
