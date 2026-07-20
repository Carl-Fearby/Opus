# Licensed components

Opus includes components that integrate third-party open-source software, hosted services, or externally licensed data. This page records those dependencies and the obligations that apply when an Opus component is shipped.

This is a practical engineering summary, not legal advice. Check the linked licence and service terms before releasing a product, especially if you replace the default provider or redistribute data.

## Map

The Opus `Map` component is an Opus React interface and visual treatment built on the following third-party layers.

| Layer | Used by Opus | Licence or policy | What consumers must do |
| --- | --- | --- | --- |
| MapLibre GL JS | Browser map renderer | [BSD 3-Clause](https://github.com/maplibre/maplibre-gl-js/blob/main/LICENSE.txt) | Retain the copyright notice, licence conditions, and disclaimer in source distributions or accompanying materials for binary distributions. Do not imply endorsement by MapLibre or its contributors. |
| OpenFreeMap | Default hosted styles and vector tiles | [MIT project licence and OpenFreeMap attribution terms](https://openfreemap.org/) | Attribute the map as described by OpenFreeMap. The hosted public service is provided without an SLA; review its [terms of service](https://openfreemap.org/tos/) before production use. |
| OpenMapTiles | Vector-tile schema and styles used by OpenFreeMap | Open-source licences listed by OpenFreeMap/OpenMapTiles | Include `© OpenMapTiles` in the map attribution when using the default OpenFreeMap styles. |
| OpenStreetMap | Underlying map and geocoding data | [Open Data Commons Open Database Licence 1.0](https://www.openstreetmap.org/copyright) | Credit OpenStreetMap and make clear that its data is available under ODbL. ODbL share-alike requirements can apply when a derived database is publicly used or distributed. |
| Nominatim | Default reverse-geocoding and submitted place-search service | [Nominatim public API usage policy](https://operations.osmfoundation.org/policies/nominatim/) and OpenStreetMap ODbL data | Display suitable attribution, cache results, avoid heavy or systematic use, keep below the stated request limit, and be able to change provider. The public endpoint is not a production SLA. |

## Required default-map attribution

When the default OpenFreeMap styles and OpenStreetMap data are used, display:

> OpenFreeMap © OpenMapTiles Data from OpenStreetMap

Link **OpenStreetMap** to its [copyright and licence page](https://www.openstreetmap.org/copyright).

The `showAttribution` prop controls MapLibre's visible attribution control. Turning that control off does **not** remove the licence obligation. If `showAttribution={false}`, provide the required credit next to the map, in an application-wide licences screen, or through another presentation allowed by the applicable attribution guidance.

## Geocoding and search

The bundled Nominatim provider is suitable for Opus demonstrations and moderate, user-triggered evaluation. Place search only runs when the user submits a query; it does not implement autocomplete.

Before production deployment, make a deliberate provider decision:

- review the current [Nominatim usage policy](https://operations.osmfoundation.org/policies/nominatim/);
- use a proxy or a provider account where appropriate;
- cache results and avoid repeated queries;
- do not send personal, confidential, or sensitive text;
- supply a custom `searchPlaces` and `reverseGeocode` implementation when the public endpoint is unsuitable;
- retain OpenStreetMap attribution when the returned data is sourced from OpenStreetMap.

Disable either integration with `searchPlaces={false}` or `reverseGeocode={false}`.

## Replacing providers

The Map component accepts custom `styleUrl`, `lightStyleUrl`, `darkStyleUrl`, `searchPlaces`, and `reverseGeocode` providers. Replacing a provider also replaces its licence, attribution, privacy, usage-limit, and commercial terms. Record the new provider on this page before release.

## Component ownership

Opus owns the React composition, accessibility structure, theme integration, hotspot panel, coordinate display, and Opus-specific styling. Opus does not claim ownership of MapLibre, OpenFreeMap, OpenMapTiles, OpenStreetMap data, or Nominatim.


