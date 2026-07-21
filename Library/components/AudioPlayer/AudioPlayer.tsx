"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  faBackwardStep,
  faForwardStep,
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/lib/fontawesome";
import styles from "./AudioPlayer.module.css";

export type AudioTrack = {
  artist?: string;
  artworkSrc?: string;
  id?: string;
  src: string;
  title?: string;
};

export type AudioPlayerProps = {
  artist?: string;
  artworkSrc?: string;
  autoPlay?: boolean;
  className?: string;
  initialIndex?: number;
  loop?: boolean;
  loopPlaylist?: boolean;
  showArtwork?: boolean;
  /** Preferred multi-track API. Falls back to `src` / `title` / `artist` / `artworkSrc`. */
  tracks?: AudioTrack[];
  src?: string;
  title?: string;
};

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function resolveTracks({
  artist,
  artworkSrc,
  src,
  title,
  tracks,
}: Pick<AudioPlayerProps, "artist" | "artworkSrc" | "src" | "title" | "tracks">): AudioTrack[] {
  if (tracks?.length) {
    return tracks;
  }

  if (!src) {
    return [];
  }

  return [
    {
      artist,
      artworkSrc,
      src,
      title,
    },
  ];
}

export function AudioPlayer({
  artist = "Opus Demo",
  artworkSrc,
  autoPlay = false,
  className,
  initialIndex = 0,
  loop = false,
  loopPlaylist = true,
  showArtwork = true,
  src,
  title = "Audio track",
  tracks,
}: AudioPlayerProps) {
  const resolvedTracks = useMemo(
    () => resolveTracks({ artist, artworkSrc, src, title, tracks }),
    [artist, artworkSrc, src, title, tracks],
  );
  const trackCount = resolvedTracks.length;
  const canNavigate = trackCount > 1;

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressId = useId();
  const [trackIndex, setTrackIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(trackCount - 1, 0)),
  );
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const shouldResumeRef = useRef(false);

  const activeTrack = resolvedTracks[trackIndex] ?? resolvedTracks[0];
  const activeSrc = activeTrack?.src ?? "";
  const activeTitle = activeTrack?.title ?? title;
  const activeArtist = activeTrack?.artist ?? artist;
  const activeArtwork = activeTrack?.artworkSrc ?? artworkSrc;

  useEffect(() => {
    setTrackIndex((current) => {
      if (trackCount === 0) {
        return 0;
      }
      return Math.min(current, trackCount - 1);
    });
  }, [trackCount]);

  const syncFromAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
    setPlaying(!audio.paused);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeSrc) {
      return;
    }

    setCurrentTime(0);
    setDuration(0);
    audio.load();

    const resume = shouldResumeRef.current || autoPlay;
    shouldResumeRef.current = false;

    if (resume) {
      void audio.play().catch(() => {
        setPlaying(false);
      });
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [activeSrc, autoPlay, trackIndex]);

  const goToTrack = useCallback(
    (nextIndex: number, { resume }: { resume?: boolean } = {}) => {
      if (trackCount === 0) {
        return;
      }

      if (!loopPlaylist && (nextIndex < 0 || nextIndex >= trackCount)) {
        return;
      }

      const wrapped = ((nextIndex % trackCount) + trackCount) % trackCount;
      shouldResumeRef.current = resume ?? playing;
      setTrackIndex(wrapped);
    },
    [loopPlaylist, playing, trackCount],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      if (!dragging) {
        setCurrentTime(audio.currentTime);
      }
    };
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (loop) {
        return;
      }

      if (canNavigate && (loopPlaylist || trackIndex < trackCount - 1)) {
        goToTrack(trackIndex + 1, { resume: true });
        return;
      }

      setPlaying(false);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    syncFromAudio();

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [
    canNavigate,
    dragging,
    goToTrack,
    loop,
    loopPlaylist,
    syncFromAudio,
    trackCount,
    trackIndex,
  ]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  };

  const seekFromClientX = (clientX: number, target: HTMLElement) => {
    const audio = audioRef.current;
    if (!audio || !duration) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const onProgressPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    seekFromClientX(event.clientX, event.currentTarget);
  };

  const onProgressPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) {
      return;
    }
    seekFromClientX(event.clientX, event.currentTarget);
  };

  const onProgressPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const canGoPrevious = canNavigate && (loopPlaylist || trackIndex > 0);
  const canGoNext = canNavigate && (loopPlaylist || trackIndex < trackCount - 1);

  if (!activeTrack) {
    return null;
  }

  return (
    <div
      className={[styles.player, className].filter(Boolean).join(" ")}
      data-component="audio-player"
      data-has-artwork={activeArtwork ? "true" : "false"}
    >
      <audio loop={loop} preload="metadata" ref={audioRef} src={activeSrc} />

      {showArtwork ? (
        <div aria-hidden="true" className={styles.artwork}>
          {activeArtwork ? (
            <img alt="" className={styles.artworkImage} src={activeArtwork} />
          ) : (
            <>
              <span className={styles.artworkGlow} />
              <span className={styles.artworkMark}>♪</span>
            </>
          )}
        </div>
      ) : null}

      <div className={styles.body}>
        <div className={styles.meta}>
          <p className={styles.title}>{activeTitle}</p>
          <p className={styles.artist}>{activeArtist}</p>
          {canNavigate ? (
            <p className={styles.trackCount}>
              Track {trackIndex + 1} of {trackCount}
            </p>
          ) : null}
        </div>

        <div
          aria-labelledby={progressId}
          aria-valuemax={duration || 0}
          aria-valuemin={0}
          aria-valuenow={currentTime}
          className={styles.progress}
          role="slider"
          tabIndex={0}
          onKeyDown={(event) => {
            const audio = audioRef.current;
            if (!audio || !duration) {
              return;
            }
            if (event.key === "ArrowRight") {
              audio.currentTime = Math.min(audio.currentTime + 5, duration);
            }
            if (event.key === "ArrowLeft") {
              audio.currentTime = Math.max(audio.currentTime - 5, 0);
            }
          }}
          onPointerDown={onProgressPointerDown}
          onPointerMove={onProgressPointerMove}
          onPointerUp={onProgressPointerUp}
        >
          <span className={styles.progressTrack} />
          <span className={styles.progressFill} style={{ width: `${progress}%` }} />
          <span className={styles.progressThumb} style={{ left: `${progress}%` }} />
        </div>

        <div className={styles.toolbar}>
          {canNavigate ? (
            <button
              aria-label="Previous track"
              className={styles.iconButton}
              disabled={!canGoPrevious}
              type="button"
              onClick={() => goToTrack(trackIndex - 1)}
            >
              <FontAwesomeIcon className={styles.icon} icon={faBackwardStep} />
            </button>
          ) : null}
          <button
            aria-label={playing ? "Pause" : "Play"}
            className={styles.playButton}
            type="button"
            onClick={() => {
              void togglePlay();
            }}
          >
            <FontAwesomeIcon className={styles.icon} icon={playing ? faPause : faPlay} />
          </button>
          {canNavigate ? (
            <button
              aria-label="Next track"
              className={styles.iconButton}
              disabled={!canGoNext}
              type="button"
              onClick={() => goToTrack(trackIndex + 1)}
            >
              <FontAwesomeIcon className={styles.icon} icon={faForwardStep} />
            </button>
          ) : null}
          <span className={styles.time} id={progressId}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className={styles.spacer} />
          <button
            aria-label={isMuted ? "Unmute" : "Mute"}
            className={styles.iconButton}
            type="button"
            onClick={() => setIsMuted((current) => !current)}
          >
            <FontAwesomeIcon
              className={styles.icon}
              icon={isMuted || volume === 0 ? faVolumeXmark : faVolumeHigh}
            />
          </button>
          <input
            aria-label="Volume"
            className={styles.volume}
            max={1}
            min={0}
            step={0.01}
            type="range"
            value={isMuted ? 0 : volume}
            onChange={(event) => {
              const next = Number(event.target.value);
              setVolume(next);
              setIsMuted(next === 0);
            }}
          />
        </div>
      </div>
    </div>
  );
}
