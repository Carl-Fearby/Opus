"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker, StyleSpecification } from "maplibre-gl";
import { TextField } from "@/components/fields/TextField";
import "maplibre-gl/dist/maplibre-gl.css";
import styles from "./Map.module.css";

export type MapCoordinate = [longitude: number, latitude: number];

export type MapMarker = {
  id: string;
  label: string;
  coordinates: MapCoordinate;
  description?: string;
  tone?: "accent" | "blue" | "green" | "warning";
};

export type MapReverseGeocoder = (
  coordinates: MapCoordinate,
  signal: AbortSignal,
) => Promise<string | null>;

export type MapSearchResult = {
  id: string;
  label: string;
  coordinates: MapCoordinate;
};

export type MapSearchProvider = (
  query: string,
  signal: AbortSignal,
) => Promise<MapSearchResult[]>;

export type MapProps = {
  ariaLabel?: string;
  center?: MapCoordinate;
  className?: string;
  darkStyleUrl?: string | StyleSpecification;
  height?: number | string;
  interactive?: boolean;
  markers?: MapMarker[];
  lightStyleUrl?: string | StyleSpecification;
  showAttribution?: boolean;
  showAddress?: boolean;
  showCoordinates?: boolean;
  showGeolocate?: boolean;
  showHotspots?: boolean;
  showNavigation?: boolean;
  showSearch?: boolean;
  styleUrl?: string | StyleSpecification;
  theme?: "auto" | "dark" | "light";
  zoom?: number;
  onMarkerClick?: (marker: MapMarker) => void;
  onMoveEnd?: (center: MapCoordinate, zoom: number) => void;
  onUserLocation?: (coordinates: MapCoordinate) => void;
  reverseGeocode?: MapReverseGeocoder | false;
  searchPlaces?: MapSearchProvider | false;
};

const DEFAULT_DARK_STYLE = "https://tiles.openfreemap.org/styles/dark";
const DEFAULT_LIGHT_STYLE = "https://tiles.openfreemap.org/styles/bright";
const addressCache = new globalThis.Map<string, string>();

export const nominatimReverseGeocode: MapReverseGeocoder = async ([longitude, latitude], signal) => {
  const key = `${longitude.toFixed(5)},${latitude.toFixed(5)}`;
  const cached = addressCache.get(key);
  if (cached) return cached;

  const parameters = new URLSearchParams({
    accept_language: typeof navigator === "undefined" ? "en" : navigator.language,
    format: "jsonv2",
    lat: String(latitude),
    lon: String(longitude),
    zoom: "18",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${parameters}`, { signal });
  if (!response.ok) throw new Error(`Reverse geocoding failed (${response.status})`);
  const result = await response.json() as { display_name?: string };
  const address = result.display_name?.trim() || null;
  if (address) addressCache.set(key, address);
  return address;
};

export const nominatimPlaceSearch: MapSearchProvider = async (query, signal) => {
  const parameters = new URLSearchParams({
    accept_language: typeof navigator === "undefined" ? "en" : navigator.language,
    format: "jsonv2",
    limit: "6",
    q: query,
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${parameters}`, { signal });
  if (!response.ok) throw new Error(`Place search failed (${response.status})`);
  const results = await response.json() as Array<{
    display_name?: string;
    lat?: string;
    lon?: string;
    osm_id?: number;
    place_id?: number;
  }>;
  return results.flatMap((result, index) => {
    const latitude = Number(result.lat);
    const longitude = Number(result.lon);
    if (!result.display_name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    return [{
      id: String(result.place_id ?? result.osm_id ?? index),
      label: result.display_name,
      coordinates: [longitude, latitude] as MapCoordinate,
    }];
  });
};

function mixMapColor(foreground: string, background: string, amount: number) {
  const parse = (value: string) => {
    const hex = value.trim().match(/^#([\da-f]{3}|[\da-f]{6})$/i)?.[1];
    if (hex) {
      const expanded = hex.length === 3 ? [...hex].map((part) => `${part}${part}`).join("") : hex;
      return [0, 2, 4].map((offset) => Number.parseInt(expanded.slice(offset, offset + 2), 16));
    }
    const rgb = value.match(/rgba?\(\s*(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)\D+(\d+(?:\.\d+)?)/i);
    return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
  };
  const front = parse(foreground);
  const back = parse(background);
  if (!front || !back) return foreground;
  const channels = front.map((channel, index) =>
    Math.round(channel * amount + back[index] * (1 - amount)),
  );
  return `rgb(${channels.join(", ")})`;
}

function applyOpusDarkPalette(map: MapLibreMap, accent: string) {
  const paint = (layer: string, property: string, value: string | number) => {
    if (map.getLayer(layer)) map.setPaintProperty(layer, property, value);
  };

  paint("background", "background-color", mixMapColor(accent, "#070918", 0.12));
  paint("water", "fill-color", mixMapColor(accent, "#071326", 0.16));
  paint("landcover_ice_shelf", "fill-color", "#20233d");
  paint("landcover_glacier", "fill-color", "#252945");
  paint("landuse_residential", "fill-color", mixMapColor(accent, "#101222", 0.22));
  paint("landcover_wood", "fill-color", "#10241f");
  paint("landuse_park", "fill-color", "#11291f");
  paint("building", "fill-color", accent);
  paint("building", "fill-opacity", 0.16);
  paint("building", "fill-outline-color", accent);
  paint("waterway", "line-color", mixMapColor(accent, "#24649a", 0.35));

  ["highway_path", "highway_minor"].forEach((layer) => {
    paint(layer, "line-color", accent);
    paint(layer, "line-opacity", 0.56);
  });
  ["highway_major_inner", "highway_motorway_inner"].forEach((layer) =>
    paint(layer, "line-color", accent),
  );
  ["highway_major_casing", "highway_motorway_casing"].forEach((layer) =>
    paint(layer, "line-color", "#171022"),
  );
  ["highway_major_subtle", "highway_motorway_subtle"].forEach((layer) => {
    paint(layer, "line-color", accent);
    paint(layer, "line-opacity", 0.68);
  });
  ["railway", "railway_minor", "railway_transit"].forEach((layer) => {
    paint(layer, "line-color", accent);
    paint(layer, "line-opacity", 0.52);
  });
  ["boundary_state", "boundary_country_z0-4", "boundary_country_z5-"].forEach((layer) =>
    paint(layer, "line-color", accent),
  );

  [
    "water_name",
    "highway_name_other",
    "highway_name_motorway",
    "place_other",
    "place_suburb",
    "place_village",
    "place_town",
    "place_city",
    "place_city_large",
    "place_state",
    "place_country_other",
    "place_country_minor",
    "place_country_major",
  ].forEach((layer) => {
    paint(layer, "text-color", "#eceaff");
    paint(layer, "text-halo-color", "#070918");
  });
}

export function Map({
  ariaLabel = "Interactive map",
  center = [-1.55, 52.48],
  className,
  darkStyleUrl = DEFAULT_DARK_STYLE,
  height = 420,
  interactive = true,
  markers = [],
  lightStyleUrl = DEFAULT_LIGHT_STYLE,
  showAttribution = false,
  showAddress = true,
  showCoordinates = false,
  showGeolocate = true,
  showHotspots = false,
  showNavigation = true,
  showSearch = true,
  styleUrl,
  theme = "auto",
  zoom = 5.2,
  onMarkerClick,
  onMoveEnd,
  onUserLocation,
  reverseGeocode = nominatimReverseGeocode,
  searchPlaces = nominatimPlaceSearch,
}: MapProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const searchInputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerInstancesRef = useRef(new globalThis.Map<string, MapLibreMarker>());
  const searchControllerRef = useRef<AbortController | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(
    theme === "light" ? "light" : "dark",
  );
  const [address, setAddress] = useState<string | null>(null);
  const [addressStatus, setAddressStatus] = useState<"idle" | "loading" | "unavailable">("idle");
  const [viewCenter, setViewCenter] = useState<MapCoordinate>(() => [center[0], center[1]]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MapSearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "unavailable">("idle");
  const callbacksRef = useRef({ onMarkerClick, onMoveEnd, onUserLocation });

  const focusMarker = (marker: MapMarker, openPopup = false) => {
    setViewCenter([marker.coordinates[0], marker.coordinates[1]]);
    mapRef.current?.flyTo({ center: marker.coordinates, zoom: Math.max(mapRef.current.getZoom(), 8) });
    if (openPopup) {
      markerInstancesRef.current.forEach((instance, id) => {
        const popup = instance.getPopup();
        if (id !== marker.id && popup?.isOpen()) instance.togglePopup();
      });
      const selectedMarker = markerInstancesRef.current.get(marker.id);
      if (selectedMarker?.getPopup() && !selectedMarker.getPopup()?.isOpen()) {
        selectedMarker.togglePopup();
      }
    }
    callbacksRef.current.onMarkerClick?.(marker);
  };

  callbacksRef.current = { onMarkerClick, onMoveEnd, onUserLocation };

  const runSearch = async () => {
    const query = searchQuery.trim();
    if (query.length < 2 || searchPlaces === false) return;
    searchControllerRef.current?.abort();
    const controller = new AbortController();
    searchControllerRef.current = controller;
    setSearchStatus("loading");
    try {
      const results = await searchPlaces(query, controller.signal);
      if (controller.signal.aborted) return;
      setSearchResults(results);
      setSearchStatus(results.length ? "idle" : "unavailable");
    } catch {
      if (!controller.signal.aborted) {
        setSearchResults([]);
        setSearchStatus("unavailable");
      }
    }
  };

  const selectSearchResult = (result: MapSearchResult) => {
    setSearchQuery(result.label);
    setSearchResults([]);
    setViewCenter([result.coordinates[0], result.coordinates[1]]);
    mapRef.current?.flyTo({ center: result.coordinates, zoom: Math.max(mapRef.current.getZoom(), 12) });
  };

  useEffect(() => () => searchControllerRef.current?.abort(), []);

  useEffect(() => {
    setViewCenter([center[0], center[1]]);
  }, [center[0], center[1]]);

  useEffect(() => {
    if (theme !== "auto") {
      setResolvedTheme(theme);
      return;
    }

    const themeRoot = shellRef.current?.closest<HTMLElement>("[data-theme]") ?? document.documentElement;
    const updateTheme = () => setResolvedTheme(themeRoot.dataset.theme === "light" ? "light" : "dark");
    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(themeRoot, { attributeFilter: ["data-theme"], attributes: true });
    return () => observer.disconnect();
  }, [theme]);

  useEffect(() => {
    if (!showCoordinates || !showAddress || reverseGeocode === false) {
      setAddress(null);
      setAddressStatus("idle");
      return;
    }

    const controller = new AbortController();
    setAddressStatus("loading");
    const timeout = window.setTimeout(() => {
      void reverseGeocode([viewCenter[0], viewCenter[1]], controller.signal)
        .then((nextAddress) => {
          if (controller.signal.aborted) return;
          setAddress(nextAddress);
          setAddressStatus(nextAddress ? "idle" : "unavailable");
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setAddress(null);
            setAddressStatus("unavailable");
          }
        });
    }, 600);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [reverseGeocode, showAddress, showCoordinates, viewCenter[0], viewCenter[1]]);

  const resolvedStyleUrl =
    typeof styleUrl === "string" && styleUrl.includes("your-map-provider.example")
      ? undefined
      : styleUrl;
  const activeStyle = resolvedStyleUrl ?? (resolvedTheme === "light" ? lightStyleUrl : darkStyleUrl);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    let accentObserver: MutationObserver | undefined;

    void import("maplibre-gl").then((module) => {
      if (disposed) return;

      const maplibregl = module.default;
      const map = new maplibregl.Map({
        attributionControl: showAttribution ? { compact: true } : false,
        center,
        container,
        cooperativeGestures: interactive,
        dragPan: interactive,
        keyboard: interactive,
        scrollZoom: interactive,
        style: activeStyle,
        zoom,
      });
      mapRef.current = map;

      const collapseAttribution = () => {
        const attribution = container.querySelector<HTMLDetailsElement>(
          ".maplibregl-ctrl-attrib.maplibregl-compact",
        );
        attribution?.classList.remove("maplibregl-compact-show");
        attribution?.removeAttribute("open");
      };
      collapseAttribution();
      map.once("load", collapseAttribution);

      if (resolvedStyleUrl === undefined && activeStyle === DEFAULT_DARK_STYLE) {
        const applyCurrentAccent = () => {
          const accent = getComputedStyle(shellRef.current ?? container)
            .getPropertyValue("--opus-accent")
            .trim() || "#8b5cf6";
          applyOpusDarkPalette(map, accent);
          if (shellRef.current) shellRef.current.dataset.mapAccent = accent;
        };
        const applyAccentChange = () => {
          if (map.isStyleLoaded()) applyCurrentAccent();
        };

        map.on("style.load", applyCurrentAccent);
        accentObserver = new MutationObserver(applyAccentChange);
        accentObserver.observe(document.documentElement, {
          attributeFilter: ["style"],
          attributes: true,
        });
      }

      if (showNavigation) {
        map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
      }

      if (showGeolocate && interactive) {
        const geolocate = new maplibregl.GeolocateControl({
          fitBoundsOptions: { maxZoom: 14 },
          positionOptions: { enableHighAccuracy: true },
          showAccuracyCircle: true,
          showUserLocation: true,
          trackUserLocation: true,
        });
        geolocate.on("geolocate", (event) => {
          const nextCenter: MapCoordinate = [event.coords.longitude, event.coords.latitude];
          setViewCenter(nextCenter);
          callbacksRef.current.onUserLocation?.(nextCenter);
        });
        geolocate.on("error", () => {
          /* Browser permission denial or unavailable GPS — control shows its own state. */
        });
        map.addControl(geolocate, "top-right");
      }

      markers.forEach((marker) => {
        const element = document.createElement("button");
        element.type = "button";
        element.className = styles.marker;
        element.dataset.tone = marker.tone ?? "accent";
        element.setAttribute("aria-label", marker.label);
        element.addEventListener("click", () => focusMarker(marker));

        const mapMarker = new maplibregl.Marker({ element })
          .setLngLat(marker.coordinates);

        if (marker.description) {
          const popupContent = document.createElement("div");
          const title = document.createElement("strong");
          const description = document.createElement("span");
          title.textContent = marker.label;
          description.textContent = marker.description;
          popupContent.className = styles.popupContent;
          popupContent.append(title, description);
          mapMarker.setPopup(new maplibregl.Popup({ offset: 18 }).setDOMContent(popupContent));
        }

        mapMarker.addTo(map);
        markerInstancesRef.current.set(marker.id, mapMarker);
      });

      map.on("moveend", () => {
        const next = map.getCenter();
        const nextCenter: MapCoordinate = [next.lng, next.lat];
        setViewCenter(nextCenter);
        callbacksRef.current.onMoveEnd?.(nextCenter, map.getZoom());
      });

      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(container);
    });

    return () => {
      disposed = true;
      accentObserver?.disconnect();
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markerInstancesRef.current.clear();
    };
  }, [activeStyle, center[0], center[1], interactive, markers, showAttribution, showGeolocate, showNavigation, zoom]);

  return (
    <div
      aria-label={ariaLabel}
      className={[styles.shell, className].filter(Boolean).join(" ")}
      data-map-theme={resolvedTheme}
      data-show-coordinates={showCoordinates ? "true" : "false"}
      ref={shellRef}
      role="region"
      style={{ height }}
    >
      {showCoordinates ? (
        <dl className={styles.coordinates} aria-label="Map centre coordinates">
          <div><dt>Longitude</dt><dd>{viewCenter[0].toFixed(4)}</dd></div>
          <div><dt>Latitude</dt><dd>{viewCenter[1].toFixed(4)}</dd></div>
          {showAddress ? (
            <div className={styles.address}>
              <dt>Address</dt>
              <dd title={address ?? undefined}>
                {addressStatus === "loading" ? "Resolving…" : address ?? "Address unavailable"}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
      <div className={styles.content} data-has-hotspots={showHotspots && markers.length ? "true" : "false"}>
        <div className={styles.mapFrame}>
          {showSearch && searchPlaces !== false ? (
            <div className={styles.search}>
              <form
                role="search"
                onSubmit={(event) => {
                  event.preventDefault();
                  void runSearch();
                }}
              >
                <TextField
                  id={searchInputId}
                  label="Search for a place"
                  labelVisuallyHidden
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchResults([]);
                    setSearchStatus("idle");
                  }}
                  placeholder="Search places…"
                  size="md"
                  type="search"
                  value={searchQuery}
                />
              </form>
              {searchResults.length || searchStatus === "unavailable" ? (
                <div className={styles.searchResults} aria-live="polite">
                  {searchResults.length ? (
                    <ul aria-label="Place search results">
                      {searchResults.map((result) => (
                        <li key={result.id}>
                          <button type="button" onClick={() => selectSearchResult(result)}>{result.label}</button>
                        </li>
                      ))}
                    </ul>
                  ) : <p>No places found</p>}
                </div>
              ) : null}
              {searchStatus === "loading" ? (
                <span aria-live="polite" className={styles.searchStatus}>Searching…</span>
              ) : null}
            </div>
          ) : null}
          <div className={styles.map} ref={containerRef} />
          <div aria-hidden="true" className={styles.atmosphere} />
        </div>
        {showHotspots && markers.length ? (
          <aside className={styles.hotspots} aria-label="Map hotspots">
            <h3>Hotspots</h3>
            <ul>
              {markers.map((marker) => (
                <li key={marker.id}>
                  <button type="button" onClick={() => focusMarker(marker, true)}>
                    <span className={styles.hotspotDot} data-tone={marker.tone ?? "accent"} />
                    <span><strong>{marker.label}</strong>{marker.description ? <small>{marker.description}</small> : null}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
