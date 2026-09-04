"use client";

import { createContext, useContext, useLayoutEffect, type ReactNode } from "react";
import {
  BackgroundBlobs,
  type BackgroundBlobSize,
} from "opus-react";

export type ViewportAtmosphereSettings = {
  animated: boolean;
  brightness: number;
  blur: number;
  colors: string[];
  count: number;
  size: BackgroundBlobSize;
};

const ViewportAtmosphereContext = createContext<
  (settings: ViewportAtmosphereSettings | null) => void
>(() => {});

export function ViewportAtmosphereProvider({
  children,
  setSettings,
}: {
  children: ReactNode;
  setSettings: (settings: ViewportAtmosphereSettings | null) => void;
}) {
  return <ViewportAtmosphereContext.Provider value={setSettings}>{children}</ViewportAtmosphereContext.Provider>;
}

export function CoverViewportBlobs({
  animated,
  brightness,
  blur,
  colors,
  count,
  size,
}: {
  animated: boolean;
  brightness: number;
  blur: number;
  colors: string[];
  count: number;
  size: BackgroundBlobSize;
}) {
  const setLayer = useContext(ViewportAtmosphereContext);

  useLayoutEffect(() => {
    const settings = { animated, brightness, blur, colors, count, size };
    setLayer(settings);
  }, [animated, brightness, blur, colors, count, setLayer, size]);

  useLayoutEffect(() => () => setLayer(null), [setLayer]);

  return null;
}

export function ViewportAtmosphere({
  settings,
}: {
  settings: ViewportAtmosphereSettings | null;
}) {
  return settings ? (
    <BackgroundBlobs
      animated={settings.animated}
      brightness={settings.brightness}
      blur={settings.blur}
      colors={settings.colors}
      count={settings.count}
      placement="absolute"
      size={settings.size}
    />
  ) : null;
}
