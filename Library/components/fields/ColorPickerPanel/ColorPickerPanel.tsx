"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  COLOR_QUICK_SWATCHES,
  hexToHsv,
  hsvToHex,
  hueToHex,
  normalizeHex,
} from "./colorPickerUtils";
import styles from "./ColorPickerPanel.module.css";

export type ColorPickerPanelProps = {
  onClose?: () => void;
  onSelect: (hex: string) => void;
  value: string;
};

export function ColorPickerPanel({ onClose, onSelect, value }: ColorPickerPanelProps) {
  const initial = hexToHsv(value || "#8f6cff");
  const [hue, setHue] = useState(initial.h);
  const [saturation, setSaturation] = useState(initial.s);
  const [brightness, setBrightness] = useState(initial.v);
  const [hexDraft, setHexDraft] = useState((normalizeHex(value) ?? "#8f6cff").toUpperCase());
  const squareRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  const hex = hsvToHex(hue, saturation, brightness);

  useEffect(() => {
    const next = normalizeHex(value);
    if (!next) return;
    const hsv = hexToHsv(next);
    setHue(hsv.h);
    setSaturation(hsv.s);
    setBrightness(hsv.v);
    setHexDraft(next.toUpperCase());
  }, [value]);

  useEffect(() => {
    setHexDraft(hex.toUpperCase());
  }, [hex]);

  function commit(nextHex: string, close = false) {
    onSelect(nextHex);
    if (close) onClose?.();
  }

  function applyHsv(nextH: number, nextS: number, nextV: number, close = false) {
    setHue(nextH);
    setSaturation(nextS);
    setBrightness(nextV);
    commit(hsvToHex(nextH, nextS, nextV), close);
  }

  function readSquare(event: ReactPointerEvent<HTMLDivElement> | PointerEvent) {
    const node = squareRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const v = Math.min(1, Math.max(0, 1 - (event.clientY - rect.top) / rect.height));
    applyHsv(hue, s, v);
  }

  function readHue(event: ReactPointerEvent<HTMLDivElement> | PointerEvent) {
    const node = hueRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const next = Math.min(359, Math.max(0, ((event.clientX - rect.left) / rect.width) * 360));
    applyHsv(next, saturation, brightness);
  }

  function bindDrag(
    start: ReactPointerEvent<HTMLDivElement>,
    reader: (event: PointerEvent) => void,
  ) {
    start.currentTarget.setPointerCapture(start.pointerId);
    reader(start.nativeEvent);
    const move = (event: PointerEvent) => reader(event);
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div className={styles.panel} role="dialog" aria-label="Choose colour">
      <div
        aria-label="Saturation and brightness"
        className={styles.square}
        ref={squareRef}
        style={{ backgroundColor: hueToHex(hue) }}
        onPointerDown={(event) => bindDrag(event, readSquare)}
      >
        <div className={styles.squareWhite} />
        <div className={styles.squareBlack} />
        <span
          aria-hidden="true"
          className={styles.squareThumb}
          style={{
            left: `${saturation * 100}%`,
            top: `${(1 - brightness) * 100}%`,
            background: hex,
          }}
        />
      </div>

      <div
        aria-label="Hue"
        className={styles.hue}
        ref={hueRef}
        onPointerDown={(event) => bindDrag(event, readHue)}
      >
        <span
          aria-hidden="true"
          className={styles.hueThumb}
          style={{ left: `${(hue / 360) * 100}%` }}
        />
      </div>

      <div className={styles.hexRow}>
        <span aria-hidden="true" className={styles.preview} style={{ background: hex }} />
        <label className={styles.hexField}>
          <span className={styles.srOnly}>Hex colour</span>
          <input
            aria-label="Hex colour"
            className={styles.hexInput}
            spellCheck={false}
            value={hexDraft}
            onBlur={() => {
              const next = normalizeHex(hexDraft);
              if (!next) {
                setHexDraft(hex.toUpperCase());
                return;
              }
              const hsv = hexToHsv(next);
              applyHsv(hsv.h, hsv.s, hsv.v);
            }}
            onChange={(event) => setHexDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                (event.target as HTMLInputElement).blur();
              }
            }}
          />
        </label>
      </div>

      <div className={styles.swatches} role="listbox" aria-label="Quick colours">
        {COLOR_QUICK_SWATCHES.map((swatch) => (
          <button
            aria-label={swatch}
            aria-selected={normalizeHex(value)?.toLowerCase() === swatch}
            className={styles.swatch}
            key={swatch}
            role="option"
            style={{ background: swatch }}
            type="button"
            onClick={() => {
              const hsv = hexToHsv(swatch);
              applyHsv(hsv.h, hsv.s, hsv.v, true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
