"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  faCompress,
  faExpand,
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/lib/fontawesome";
import styles from "./VideoPlayer.module.css";

export type VideoPlayerProps = {
  autoPlay?: boolean;
  className?: string;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  showTitle?: boolean;
  src: string;
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

const CONTROLS_HIDE_DELAY_MS = 2500;

export function VideoPlayer({
  autoPlay = false,
  className,
  loop = false,
  muted = false,
  poster,
  showTitle = true,
  src,
  title = "Video",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const progressId = useId();
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 0.85);
  const [isMuted, setIsMuted] = useState(muted);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const syncFromVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    setCurrentTime(video.currentTime);
    setDuration(video.duration || 0);
    setPlaying(!video.paused);
  }, []);

  const clearHideControlsTimer = useCallback(() => {
    if (hideControlsTimeoutRef.current == null) {
      return;
    }

    window.clearTimeout(hideControlsTimeoutRef.current);
    hideControlsTimeoutRef.current = null;
  }, []);

  const scheduleHideControls = useCallback(() => {
    clearHideControlsTimer();

    if (!isFullscreen || draggingRef.current) {
      return;
    }

    const video = videoRef.current;
    if (!video || video.paused) {
      setControlsVisible(true);
      return;
    }

    hideControlsTimeoutRef.current = window.setTimeout(() => {
      if (!draggingRef.current) {
        setControlsVisible(false);
      }
    }, CONTROLS_HIDE_DELAY_MS);
  }, [clearHideControlsTimer, isFullscreen]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    draggingRef.current = dragging;
    if (dragging) {
      clearHideControlsTimer();
      setControlsVisible(true);
      return;
    }

    scheduleHideControls();
  }, [clearHideControlsTimer, dragging, scheduleHideControls]);

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = document.fullscreenElement === rootRef.current;
      setIsFullscreen(active);
      setControlsVisible(true);
      clearHideControlsTimer();
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      clearHideControlsTimer();
    };
  }, [clearHideControlsTimer]);

  useEffect(() => {
    if (!isFullscreen) {
      clearHideControlsTimer();
      setControlsVisible(true);
      return;
    }

    // Show controls immediately on enter; only start the idle timer once playing.
    setControlsVisible(true);
    if (playing) {
      scheduleHideControls();
    }
  }, [clearHideControlsTimer, isFullscreen, playing, scheduleHideControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      if (!dragging) {
        setCurrentTime(video.currentTime);
      }
    };
    const onMeta = () => setDuration(video.duration || 0);
    const onEnded = () => setPlaying(false);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("ended", onEnded);
    syncFromVideo();

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("ended", onEnded);
    };
  }, [dragging, src, syncFromVideo]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      await video.play();
    } else {
      video.pause();
    }
  };

  const seekFromClientX = (clientX: number, target: HTMLElement) => {
    const video = videoRef.current;
    if (!video || !duration) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    video.currentTime = ratio * duration;
    setCurrentTime(video.currentTime);
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

  const toggleMute = () => {
    setIsMuted((current) => !current);
  };

  const toggleFullscreen = async () => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await root.requestFullscreen();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={[styles.player, className].filter(Boolean).join(" ")}
      data-component="video-player"
      data-controls-visible={controlsVisible ? "true" : "false"}
      data-fullscreen={isFullscreen ? "true" : "false"}
      ref={rootRef}
      onPointerDown={() => {
        if (isFullscreen) {
          revealControls();
        }
      }}
      onPointerMove={() => {
        if (isFullscreen) {
          revealControls();
        }
      }}
    >
      <div className={styles.stage}>
        <video
          autoPlay={autoPlay}
          className={styles.video}
          loop={loop}
          muted={isMuted}
          playsInline
          poster={poster}
          preload="metadata"
          ref={videoRef}
          src={src}
          onClick={() => {
            void togglePlay();
          }}
        />
        <button
          aria-label={playing ? "Pause" : "Play"}
          className={styles.centerPlay}
          data-visible={playing ? "false" : "true"}
          type="button"
          onClick={() => {
            void togglePlay();
          }}
        >
          <FontAwesomeIcon className={styles.icon} icon={playing ? faPause : faPlay} />
        </button>
      </div>

      <div className={styles.controls}>
        {showTitle ? <p className={styles.title}>{title}</p> : null}
        <div
          aria-labelledby={progressId}
          aria-valuemax={duration || 0}
          aria-valuemin={0}
          aria-valuenow={currentTime}
          className={styles.progress}
          role="slider"
          tabIndex={0}
          onKeyDown={(event) => {
            const video = videoRef.current;
            if (!video || !duration) {
              return;
            }
            if (event.key === "ArrowRight") {
              video.currentTime = Math.min(video.currentTime + 5, duration);
            }
            if (event.key === "ArrowLeft") {
              video.currentTime = Math.max(video.currentTime - 5, 0);
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
          <button
            aria-label={playing ? "Pause" : "Play"}
            className={styles.iconButton}
            type="button"
            onClick={() => {
              void togglePlay();
            }}
          >
            <FontAwesomeIcon className={styles.icon} icon={playing ? faPause : faPlay} />
          </button>
          <span className={styles.time} id={progressId}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className={styles.spacer} />
          <button
            aria-label={isMuted ? "Unmute" : "Mute"}
            className={styles.iconButton}
            type="button"
            onClick={toggleMute}
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
          <button
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className={styles.iconButton}
            type="button"
            onClick={() => {
              void toggleFullscreen();
            }}
          >
            <FontAwesomeIcon
              className={styles.icon}
              icon={isFullscreen ? faCompress : faExpand}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
