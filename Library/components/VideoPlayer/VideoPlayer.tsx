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
  faCompress,
  faExpand,
  faForwardStep,
  faPause,
  faPlay,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@/lib/fontawesome";
import { MediaShareCastControl } from "@/components/MediaShareCastControl";
import styles from "./VideoPlayer.module.css";

export type VideoTrack = {
  id?: string;
  /** Seconds to park on for the idle preview frame (before play). */
  previewTime?: number;
  src: string;
  title?: string;
};

export type VideoPlayerProps = {
  autoPlay?: boolean;
  className?: string;
  initialIndex?: number;
  loop?: boolean;
  loopPlaylist?: boolean;
  muted?: boolean;
  shareUrl?: string;
  showShare?: boolean;
  showTitle?: boolean;
  /** Preferred multi-track API. Falls back to `src` / `title`. */
  tracks?: VideoTrack[];
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
  src,
  title,
  tracks,
}: Pick<VideoPlayerProps, "src" | "title" | "tracks">): VideoTrack[] {
  if (tracks?.length) {
    return tracks;
  }

  if (!src) {
    return [];
  }

  return [
    {
      src,
      title,
    },
  ];
}

const CONTROLS_HIDE_DELAY_MS = 2500;
/** Default preview seek when a track does not set `previewTime`. */
const DEFAULT_PREVIEW_TIME = 10;

function waitForVideoEvent(
  video: HTMLVideoElement,
  eventName: "seeked" | "loadeddata" | "canplay",
) {
  return new Promise<void>((resolve) => {
    const onEvent = () => {
      video.removeEventListener(eventName, onEvent);
      resolve();
    };
    video.addEventListener(eventName, onEvent);
  });
}

async function seekVideo(video: HTMLVideoElement, time: number) {
  if (!Number.isFinite(video.duration) || video.duration <= 0) {
    await waitForVideoEvent(video, "loadeddata");
  }

  const target = Math.min(Math.max(time, 0), Math.max((video.duration || time) - 0.001, 0));
  if (Math.abs(video.currentTime - target) < 0.001 && video.readyState >= 2) {
    return;
  }

  const seeked = waitForVideoEvent(video, "seeked");
  video.currentTime = target;
  await seeked;
}

async function waitForPaintedFrame(video: HTMLVideoElement) {
  const withFrameCallback = video as HTMLVideoElement & {
    requestVideoFrameCallback?: (callback: () => void) => number;
  };

  if (typeof withFrameCallback.requestVideoFrameCallback === "function") {
    await new Promise<void>((resolve) => {
      withFrameCallback.requestVideoFrameCallback(() => resolve());
    });
    return;
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

async function paintVideoFrame(video: HTMLVideoElement, time: number) {
  const previousMuted = video.muted;
  video.muted = true;
  video.playsInline = true;

  try {
    await seekVideo(video, time);
    try {
      await video.play();
      await waitForPaintedFrame(video);
      video.pause();
    } catch {
      // Seek alone is enough in some browsers.
    }
  } finally {
    video.muted = previousMuted;
  }
}

export function VideoPlayer({
  autoPlay = false,
  className,
  initialIndex = 0,
  loop = false,
  loopPlaylist = true,
  muted = false,
  shareUrl,
  showShare = true,
  showTitle = true,
  src,
  title = "Video",
  tracks,
}: VideoPlayerProps) {
  const resolvedTracks = useMemo(
    () => resolveTracks({ src, title, tracks }),
    [src, title, tracks],
  );
  const trackCount = resolvedTracks.length;
  const canNavigate = trackCount > 1;

  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const framePaintedRef = useRef(false);
  const resumeFromStartRef = useRef(false);
  const shouldResumeRef = useRef(false);
  const progressId = useId();
  const [trackIndex, setTrackIndex] = useState(() =>
    Math.min(Math.max(initialIndex, 0), Math.max(trackCount - 1, 0)),
  );
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(muted ? 0 : 0.85);
  const [isMuted, setIsMuted] = useState(muted);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const activeTrack = resolvedTracks[trackIndex] ?? resolvedTracks[0];
  const activeSrc = activeTrack?.src ?? "";
  const activeTitle = activeTrack?.title ?? title;
  const previewTime = activeTrack?.previewTime ?? DEFAULT_PREVIEW_TIME;

  useEffect(() => {
    setTrackIndex((current) => {
      if (trackCount === 0) {
        return 0;
      }
      return Math.min(current, trackCount - 1);
    });
  }, [trackCount]);

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
    framePaintedRef.current = false;
    resumeFromStartRef.current = false;
  }, [activeSrc]);

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
    const video = videoRef.current;
    if (!video || !activeSrc) {
      return;
    }

    let cancelled = false;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      if (!draggingRef.current) {
        setCurrentTime(video.currentTime);
      }
    };
    const onMeta = () => setDuration(video.duration || 0);
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

    const paintFirstFrame = () => {
      if (cancelled || framePaintedRef.current || autoPlay || shouldResumeRef.current || !video.paused) {
        return;
      }

      framePaintedRef.current = true;
      void paintVideoFrame(video, previewTime)
        .then(() => {
          if (cancelled) {
            return;
          }
          resumeFromStartRef.current = video.currentTime > 0.001;
          setCurrentTime(video.currentTime);
          setPlaying(false);
          setDuration(video.duration || 0);
        })
        .catch(() => {
          if (!cancelled) {
            framePaintedRef.current = false;
          }
        });
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", paintFirstFrame);
    video.addEventListener("canplay", paintFirstFrame);
    video.addEventListener("ended", onEnded);

    setCurrentTime(0);
    setDuration(0);
    video.load();

    const resume = shouldResumeRef.current || autoPlay;
    shouldResumeRef.current = false;

    if (resume) {
      framePaintedRef.current = true;
      resumeFromStartRef.current = false;
      void video.play().catch(() => {
        setPlaying(false);
      });
    } else {
      video.pause();
      setPlaying(false);
      if (video.readyState >= 2) {
        paintFirstFrame();
      }
    }

    syncFromVideo();

    return () => {
      cancelled = true;
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", paintFirstFrame);
      video.removeEventListener("canplay", paintFirstFrame);
      video.removeEventListener("ended", onEnded);
    };
  }, [
    activeSrc,
    autoPlay,
    canNavigate,
    goToTrack,
    loop,
    loopPlaylist,
    previewTime,
    syncFromVideo,
    trackCount,
    trackIndex,
  ]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.paused) {
      if (resumeFromStartRef.current) {
        resumeFromStartRef.current = false;
        video.currentTime = 0;
      }
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
    resumeFromStartRef.current = false;
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
  const canGoPrevious = canNavigate && (loopPlaylist || trackIndex > 0);
  const canGoNext = canNavigate && (loopPlaylist || trackIndex < trackCount - 1);

  if (!activeTrack) {
    return null;
  }

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
          preload="auto"
          ref={videoRef}
          src={activeSrc}
          onClick={() => {
            void togglePlay();
          }}
          {...{ "x-webkit-airplay": "allow" }}
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
        {showTitle ? (
          <div className={styles.titleRow}>
            <p className={styles.title}>{activeTitle}</p>
            {canNavigate ? (
              <p className={styles.trackCount}>
                {trackIndex + 1} / {trackCount}
              </p>
            ) : null}
          </div>
        ) : null}
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
          {canNavigate ? (
            <button
              aria-label="Previous video"
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
            className={styles.iconButton}
            type="button"
            onClick={() => {
              void togglePlay();
            }}
          >
            <FontAwesomeIcon className={styles.icon} icon={playing ? faPause : faPlay} />
          </button>
          {canNavigate ? (
            <button
              aria-label="Next video"
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
          {showShare ? (
            <MediaShareCastControl
              fileUrl={activeSrc}
              iconClassName={styles.icon}
              mediaRef={videoRef}
              shareUrl={shareUrl}
              showDownload
              title={activeTitle}
            />
          ) : null}
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
