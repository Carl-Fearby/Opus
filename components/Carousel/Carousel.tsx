"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { GalleryImage } from "@/components/fields/types";
import "@/lib/fontawesome";
import { Lightbox } from "@/components/Lightbox";
import styles from "./Carousel.module.css";

type CarouselProps = {
  ariaLabel?: string;
  images: GalleryImage[];
  initialIndex?: number;
  loop?: boolean;
  showCaptions?: boolean;
  showPips?: boolean;
};

function safeIndex(index: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), total - 1);
}

function buildTrackImages(images: GalleryImage[], loopEnabled: boolean) {
  if (!loopEnabled) {
    return images;
  }

  const last = images[images.length - 1]!;
  const first = images[0]!;

  return [last, ...images, first];
}

function getRealIndex(trackIndex: number, imagesLength: number, loopEnabled: boolean) {
  if (imagesLength === 0) {
    return 0;
  }

  if (!loopEnabled) {
    return safeIndex(trackIndex, imagesLength);
  }

  if (trackIndex === 0) {
    return imagesLength - 1;
  }

  if (trackIndex === imagesLength + 1) {
    return 0;
  }

  return safeIndex(trackIndex - 1, imagesLength);
}

function getTrackIndexForRealIndex(realIndex: number, loopEnabled: boolean) {
  return loopEnabled ? realIndex + 1 : realIndex;
}

export function Carousel({
  ariaLabel = "Image carousel",
  images,
  initialIndex = 0,
  loop = true,
  showCaptions = true,
  showPips = true,
}: CarouselProps) {
  const hasMultiple = images.length > 1;
  const loopEnabled = loop && hasMultiple;
  const trackImages = useMemo(
    () => buildTrackImages(images, loopEnabled),
    [images, loopEnabled],
  );

  const [trackIndex, setTrackIndex] = useState(() => {
    const base = safeIndex(initialIndex, images.length);
    return getTrackIndexForRealIndex(base, loopEnabled);
  });
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const isJumpingRef = useRef(false);

  useEffect(() => {
    if (images.length === 0) {
      return;
    }

    const base = safeIndex(initialIndex, images.length);
    setTransitionEnabled(false);
    setIsAnimating(false);
    setTrackIndex(getTrackIndexForRealIndex(base, loopEnabled));

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [images.length, initialIndex, loopEnabled]);

  const activeIndex = getRealIndex(trackIndex, images.length, loopEnabled);
  const activeImage = images[activeIndex];

  const goToTrackIndex = useCallback((nextTrackIndex: number, animate = true) => {
    if (trackImages.length === 0) {
      return;
    }

    const maxIndex = trackImages.length - 1;
    const clamped = Math.min(Math.max(nextTrackIndex, 0), maxIndex);

    if (animate && isAnimating) {
      return;
    }

    setTransitionEnabled(animate);
    if (animate) {
      setIsAnimating(true);
    }

    setTrackIndex(clamped);
  }, [isAnimating, trackImages.length]);

  const goTo = useCallback((targetIndex: number) => {
    if (images.length === 0) {
      return;
    }

    const normalized = loopEnabled
      ? ((targetIndex % images.length) + images.length) % images.length
      : safeIndex(targetIndex, images.length);

    if (normalized === activeIndex) {
      return;
    }

    goToTrackIndex(getTrackIndexForRealIndex(normalized, loopEnabled), true);
  }, [activeIndex, goToTrackIndex, images.length, loopEnabled]);

  const finishJump = useCallback((nextTrackIndex: number) => {
    isJumpingRef.current = true;
    setTransitionEnabled(false);
    setTrackIndex(nextTrackIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
        setTransitionEnabled(true);
        setIsAnimating(false);
      });
    });
  }, []);

  const handlePrevious = () => {
    if (isAnimating) {
      return;
    }

    if (!loopEnabled && trackIndex === 0) {
      return;
    }

    goToTrackIndex(trackIndex - 1, true);
  };

  const handleNext = () => {
    if (isAnimating) {
      return;
    }

    if (!loopEnabled && trackIndex === trackImages.length - 1) {
      return;
    }

    goToTrackIndex(trackIndex + 1, true);
  };

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (
      event.target !== event.currentTarget
      || event.propertyName !== "transform"
      || isJumpingRef.current
    ) {
      return;
    }

    if (!loopEnabled) {
      setIsAnimating(false);
      return;
    }

    if (trackIndex === trackImages.length - 1) {
      finishJump(1);
      return;
    }

    if (trackIndex === 0) {
      finishJump(trackImages.length - 2);
      return;
    }

    setIsAnimating(false);
  };

  if (images.length === 0) {
    return (
      <div className={styles.empty} role="status">
        No carousel images available.
      </div>
    );
  }

  return (
    <section
      aria-label={ariaLabel}
      className={styles.carousel}
      tabIndex={hasMultiple ? 0 : undefined}
      onKeyDown={(event) => {
        if (!hasMultiple || isAnimating) {
          return;
        }

        if (event.key === "ArrowLeft") {
          event.preventDefault();
          handlePrevious();
          return;
        }

        if (event.key === "ArrowRight") {
          event.preventDefault();
          handleNext();
        }
      }}
    >
      <span aria-atomic="true" aria-live="polite" className={styles.visuallyHidden}>
        {`Slide ${activeIndex + 1} of ${images.length}${activeImage?.caption ? `: ${activeImage.caption}` : ""}`}
      </span>
      <div className={styles.stage}>
        <div
          className={styles.track}
          data-transition={transitionEnabled ? "true" : "false"}
          style={{ transform: `translateX(-${trackIndex * 100}%)` }}
          onTransitionEnd={handleTransitionEnd}
        >
          {trackImages.map((image, index) => (
            <div className={styles.slide} key={`${image.id ?? image.src}-${index}`}>
              <Lightbox
                image={image}
                showCaption={showCaptions}
                trigger={(
                  <img
                    alt=""
                    className={styles.image}
                    src={image.src}
                  />
                )}
                triggerLabel={`Open ${image.caption ?? image.alt}`}
                triggerVariant="image"
              />
            </div>
          ))}
        </div>
        {hasMultiple ? (
          <>
            <button
              aria-label="Previous slide"
              className={styles.nav}
              data-direction="previous"
              disabled={isAnimating || (!loopEnabled && trackIndex === 0)}
              type="button"
              onClick={handlePrevious}
            >
              <FontAwesomeIcon aria-hidden="true" className={styles.navIcon} icon={faChevronLeft} />
            </button>
            <button
              aria-label="Next slide"
              className={styles.nav}
              data-direction="next"
              disabled={isAnimating || (!loopEnabled && trackIndex === trackImages.length - 1)}
              type="button"
              onClick={handleNext}
            >
              <FontAwesomeIcon aria-hidden="true" className={styles.navIcon} icon={faChevronRight} />
            </button>
            {showPips ? (
              <div aria-label="Choose slide" className={styles.pips}>
                {images.map((image, index) => (
                  <button
                    aria-current={index === activeIndex ? "true" : undefined}
                    aria-label={`Show ${image.caption ?? image.alt}`}
                    className={styles.pip}
                    data-active={index === activeIndex}
                    disabled={isAnimating}
                    key={image.id ?? image.src}
                    type="button"
                    onClick={() => goTo(index)}
                  />
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      {showCaptions && activeImage?.caption ? (
        <div className={styles.footer}>
          <p className={styles.caption}>{activeImage.caption}</p>
        </div>
      ) : null}
    </section>
  );
}
