"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { faCompress, faExpand, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VideoPlayer, type VideoPlayerProps } from "./VideoPlayer";
import styles from "./PersistentVideoPlayer.module.css";

type PlayerSession = {
  anchor: HTMLElement | null;
  hasPlayed: boolean;
  id: string;
  props: PersistentVideoPlayerProps;
};

type PersistentVideoPlayerContextValue = {
  register: (id: string, anchor: HTMLElement, props: PersistentVideoPlayerProps) => void;
  unregister: (id: string) => void;
  update: (id: string, props: PersistentVideoPlayerProps) => void;
};

export type PersistentVideoPlayerProviderProps = {
  children: ReactNode;
  /** Width of the bottom-right player after its inline anchor unmounts. */
  miniPlayerWidth?: number;
  /** Space between the mini player and the viewport edges. */
  miniPlayerOffset?: number;
};

export type PersistentVideoPlayerProps = VideoPlayerProps & {
  /** Accessible label for the persistent player surface. */
  persistentLabel?: string;
};

const PersistentVideoPlayerContext = createContext<PersistentVideoPlayerContextValue | null>(null);

function readAnchorRect(anchor: HTMLElement | null) {
  if (!anchor) return null;
  const rect = anchor.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;
  const visible = rect.bottom > 0
    && rect.right > 0
    && rect.top < window.innerHeight
    && rect.left < window.innerWidth;
  return visible ? rect : null;
}

export function PersistentVideoPlayerProvider({
  children,
  miniPlayerOffset = 20,
  miniPlayerWidth = 360,
}: PersistentVideoPlayerProviderProps) {
  const [session, setSession] = useState<PlayerSession | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [expanded, setExpanded] = useState(false);

  const measure = useCallback(() => {
    setAnchorRect(readAnchorRect(session?.anchor ?? null));
  }, [session?.anchor]);

  useLayoutEffect(() => {
    measure();
    const anchor = session?.anchor;
    if (!anchor) return;

    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(measure);
    observer?.observe(anchor);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure, session?.anchor]);

  const register = useCallback((id: string, anchor: HTMLElement, props: PersistentVideoPlayerProps) => {
    setExpanded(false);
    setSession((current) => ({
      anchor,
      hasPlayed: current?.id === id ? current.hasPlayed : false,
      id,
      props,
    }));
  }, []);

  const unregister = useCallback((id: string) => {
    setSession((current) => {
      if (!current || current.id !== id) return current;
      return current.hasPlayed ? { ...current, anchor: null } : null;
    });
    setAnchorRect(null);
  }, []);

  const update = useCallback((id: string, props: PersistentVideoPlayerProps) => {
    setSession((current) => current?.id === id ? { ...current, props } : current);
  }, []);

  const contextValue = useMemo(
    () => ({ register, unregister, update }),
    [register, unregister, update],
  );

  const isMini = Boolean(session && !anchorRect);
  const playerStyle = useMemo<CSSProperties | undefined>(() => {
    if (!session) return undefined;
    if (anchorRect) {
      return {
        height: anchorRect.height,
        left: anchorRect.left,
        top: anchorRect.top,
        width: anchorRect.width,
      };
    }
    const viewportWidth = typeof window === "undefined"
      ? miniPlayerWidth + miniPlayerOffset * 2
      : window.innerWidth;
    const width = expanded
      ? Math.min(720, viewportWidth - miniPlayerOffset * 2)
      : Math.min(miniPlayerWidth, viewportWidth - miniPlayerOffset * 2);
    return {
      bottom: miniPlayerOffset,
      height: width * 9 / 16,
      right: miniPlayerOffset,
      width,
    };
  }, [anchorRect, expanded, miniPlayerOffset, miniPlayerWidth, session]);

  return (
    <PersistentVideoPlayerContext.Provider value={contextValue}>
      {children}
      {session ? (
        <aside
          aria-label={session.props.persistentLabel ?? "Persistent video player"}
          className={styles.surface}
          data-mini={isMini ? "true" : "false"}
          style={playerStyle}
        >
          {isMini ? (
            <div className={styles.miniActions}>
              <button
                aria-label={expanded ? "Shrink mini player" : "Expand mini player"}
                type="button"
                onClick={() => setExpanded((current) => !current)}
              >
                <FontAwesomeIcon icon={expanded ? faCompress : faExpand} />
              </button>
              <button aria-label="Close mini player" type="button" onClick={() => setSession(null)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          ) : null}
          <VideoPlayer
            {...session.props}
            edgeToEdge={isMini || session.props.edgeToEdge}
            onPlayingChange={(playing) => {
              if (playing) {
                setSession((current) => current ? { ...current, hasPlayed: true } : current);
              }
              session.props.onPlayingChange?.(playing);
            }}
          />
        </aside>
      ) : null}
    </PersistentVideoPlayerContext.Provider>
  );
}

/**
 * Anchor for a player owned by PersistentVideoPlayerProvider. The provider keeps
 * the media element mounted when this anchor disappears during route changes.
 */
export function PersistentVideoPlayer(props: PersistentVideoPlayerProps) {
  const context = useContext(PersistentVideoPlayerContext);
  const id = useId();
  const anchorRef = useRef<HTMLDivElement>(null);

  if (!context) {
    throw new Error("PersistentVideoPlayer must be used within PersistentVideoPlayerProvider");
  }

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    context.register(id, anchor, props);
    return () => context.unregister(id);
    // Registration is deliberately tied to the anchor lifecycle. Prop updates
    // are handled separately so controlled settings do not replace the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, id]);

  useEffect(() => {
    context.update(id, props);
  }, [context, id, props]);

  return <div aria-hidden="true" className={styles.anchor} ref={anchorRef} />;
}
