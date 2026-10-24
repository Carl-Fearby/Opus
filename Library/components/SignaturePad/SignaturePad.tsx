"use client";
import { useEffect, useRef, type PointerEvent } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./SignaturePad.module.css";

export type SignaturePadProps = {
  width?: number;
  height?: number;
  disabled?: boolean;
  onChange?: (dataUrl: string) => void;
  onClear?: () => void;
};

export function SignaturePad({ width = 640, height = 220, disabled, onChange, onClear }: SignaturePadProps) {
  const { t } = useOpusI18n();
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = width;
    c.height = height;
    const x = c.getContext("2d");
    if (x) {
      x.lineCap = "round";
      x.lineJoin = "round";
      x.lineWidth = 2.5;
      x.strokeStyle = getComputedStyle(c).getPropertyValue("--opus-accent") || "#8b5cf6";
    }
  }, [height, width]);

  const point = (e: PointerEvent<HTMLCanvasElement>) => {
    const c = e.currentTarget;
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * c.width / r.width,
      y: (e.clientY - r.top) * c.height / r.height,
    };
  };

  return (
    <section className={styles.root}>
      <canvas
        aria-label={t("signaturePad.area", "Signature drawing area")}
        ref={ref}
        onPointerDown={(e) => {
          if (disabled) return;
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          const p = point(e);
          const x = e.currentTarget.getContext("2d");
          x?.beginPath();
          x?.moveTo(p.x, p.y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const p = point(e);
          const x = e.currentTarget.getContext("2d");
          x?.lineTo(p.x, p.y);
          x?.stroke();
        }}
        onPointerUp={(e) => {
          drawing.current = false;
          onChange?.(e.currentTarget.toDataURL());
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          const c = ref.current;
          c?.getContext("2d")?.clearRect(0, 0, c.width, c.height);
          onClear?.();
        }}
      >
        {t("signaturePad.clearSignature", "Clear signature")}
      </button>
    </section>
  );
}
