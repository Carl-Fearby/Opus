"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/fields";
import styles from "./ProductTour.module.css";

export type ProductTourStep = {
  id: string;
  target: string;
  /** Used when the primary target is not present, such as in an isolated preview. */
  fallbackTarget?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right";
};

export type ProductTourProps = {
  open: boolean;
  steps: ProductTourStep[];
  step?: number;
  onStepChange?: (step: number) => void;
  onComplete?: () => void;
  onDismiss?: () => void;
};

const DEFAULT_CARD_SIZE = { width: 320, height: 190 };
const VIEWPORT_GAP = 12;
const CARD_FADE_MS = 140;

function resolveTarget(step: ProductTourStep): Element | null {
  return document.querySelector(step.target) ??
    (step.fallbackTarget ? document.querySelector(step.fallbackTarget) : null);
}

function cardPosition(
  rect: DOMRect,
  placement: ProductTourStep["placement"],
  cardSize: { width: number; height: number },
): CSSProperties {
  const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - cardSize.width - VIEWPORT_GAP);
  const maxTop = Math.max(VIEWPORT_GAP, window.innerHeight - cardSize.height - VIEWPORT_GAP);
  const centredLeft = rect.left + rect.width / 2 - cardSize.width / 2;
  const centredTop = rect.top + rect.height / 2 - cardSize.height / 2;

  if (placement === "left") {
    return {
      left: Math.max(VIEWPORT_GAP, Math.min(maxLeft, rect.left - cardSize.width - VIEWPORT_GAP)),
      top: Math.max(VIEWPORT_GAP, Math.min(maxTop, centredTop)),
    };
  }

  if (placement === "right") {
    return {
      left: Math.max(VIEWPORT_GAP, Math.min(maxLeft, rect.right + VIEWPORT_GAP)),
      top: Math.max(VIEWPORT_GAP, Math.min(maxTop, centredTop)),
    };
  }

  return {
    left: Math.max(VIEWPORT_GAP, Math.min(maxLeft, centredLeft)),
    top:
      placement === "top"
        ? Math.max(VIEWPORT_GAP, Math.min(maxTop, rect.top - cardSize.height - VIEWPORT_GAP))
        : Math.max(VIEWPORT_GAP, Math.min(maxTop, rect.bottom + VIEWPORT_GAP)),
  };
}

export function ProductTour({
  open,
  steps,
  step,
  onStepChange,
  onComplete,
  onDismiss,
}: ProductTourProps) {
  const [internalStep, setInternalStep] = useState(0);
  const [renderedStep, setRenderedStep] = useState(step ?? 0);
  const [present, setPresent] = useState(open);
  const [cardVisible, setCardVisible] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [cardSize, setCardSize] = useState(DEFAULT_CARD_SIZE);
  const cardRef = useRef<HTMLElement>(null);
  const cardTimerRef = useRef<number | null>(null);
  const presenceTimerRef = useRef<number | null>(null);
  const index = step ?? internalStep;
  const current = steps[renderedStep];

  useEffect(() => {
    if (open && step === undefined) {
      setInternalStep(0);
      setRenderedStep(0);
    }
  }, [open, step]);

  useEffect(() => {
    if (presenceTimerRef.current !== null) {
      window.clearTimeout(presenceTimerRef.current);
    }

    if (open) {
      setPresent(true);
      setCardVisible(false);
      return;
    }

    setCardVisible(false);
    presenceTimerRef.current = window.setTimeout(() => setPresent(false), CARD_FADE_MS);

    return () => {
      if (presenceTimerRef.current !== null) {
        window.clearTimeout(presenceTimerRef.current);
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open || index === renderedStep) {
      return;
    }

    setCardVisible(false);
    if (cardTimerRef.current !== null) {
      window.clearTimeout(cardTimerRef.current);
    }
    cardTimerRef.current = window.setTimeout(() => {
      setRenderedStep(index);
    }, CARD_FADE_MS);

    return () => {
      if (cardTimerRef.current !== null) {
        window.clearTimeout(cardTimerRef.current);
      }
    };
  }, [index, open, renderedStep]);

  useEffect(() => {
    if (!present || !current) {
      setRect(null);
      return;
    }

    const target = resolveTarget(current);
    if (!target) {
      setRect(null);
      return;
    }

    const update = () => setRect(target.getBoundingClientRect());
    const initialRect = target.getBoundingClientRect();
    const isOutsideViewport =
      initialRect.top < 0 ||
      initialRect.left < 0 ||
      initialRect.bottom > window.innerHeight ||
      initialRect.right > window.innerWidth;

    if (isOutsideViewport) {
      target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    update();
    const animationFrame = window.requestAnimationFrame(() => {
      update();
      if (open) {
        setCardVisible(true);
      }
    });
    const settleTimer = window.setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [current, open, present]);

  useLayoutEffect(() => {
    if (!present || !cardRef.current) {
      return;
    }

    const measured = {
      width: cardRef.current.offsetWidth,
      height: cardRef.current.offsetHeight,
    };
    setCardSize((previous) =>
      Math.abs(previous.width - measured.width) < 0.5 && Math.abs(previous.height - measured.height) < 0.5
        ? previous
        : { width: measured.width, height: measured.height },
    );
  }, [current, present, rect]);

  if (!present || !current || !rect || typeof document === "undefined") {
    return null;
  }

  const move = (nextStep: number) => {
    setInternalStep(nextStep);
    onStepChange?.(nextStep);
  };

  return createPortal(
    <div className={styles.layer}>
      <div
        aria-hidden="true"
        className={styles.focus}
        style={{ left: rect.left - 6, top: rect.top - 6, width: rect.width + 12, height: rect.height + 12 }}
      />
      <section
        aria-label="Product tour"
        aria-live="polite"
        className={`${styles.card} ${cardVisible ? styles.cardVisible : styles.cardHidden}`}
        ref={cardRef}
        style={cardPosition(rect, current.placement, cardSize)}
      >
        <small>Step {renderedStep + 1} of {steps.length}</small>
        <h2>{current.title}</h2>
        <p>{current.description}</p>
        <footer>
          <Button size="sm" variant="ghost" onClick={onDismiss}>Skip</Button>
          <span />
          {renderedStep > 0 ? <Button size="sm" variant="secondary" onClick={() => move(renderedStep - 1)}>Back</Button> : null}
          <Button
            size="sm"
            onClick={() => (renderedStep === steps.length - 1 ? onComplete?.() : move(renderedStep + 1))}
          >
            {renderedStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
