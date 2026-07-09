export type TilesCatalogEntry = {
  componentName: string;
  description: string;
  navigationGroup: "Tiles";
  slug: "tile" | "tiles" | "stat-tile" | "stat-tiles";
  sourceFiles: string[];
  title: string;
};

export const tilesCatalog = [
  {
    slug: "tile",
    title: "Tile",
    componentName: "Tile",
    navigationGroup: "Tiles",
    description: "Neon glass quick-action tile with purple or blue glow accent.",
    sourceFiles: ["components/Tile/Tile.tsx", "components/Tile/Tile.module.css"],
  },
  {
    slug: "tiles",
    title: "Tiles",
    componentName: "Tiles",
    navigationGroup: "Tiles",
    description: "Horizontal row of neon glass quick-action tiles.",
    sourceFiles: ["components/Tiles/Tiles.tsx", "components/Tiles/Tiles.module.css"],
  },
  {
    slug: "stat-tile",
    title: "Stat Tile",
    componentName: "StatTile",
    navigationGroup: "Tiles",
    description: "Dashboard metric tile with value, trend, comparison text, and icon badge.",
    sourceFiles: ["components/StatTile/StatTile.tsx", "components/StatTile/StatTile.module.css"],
  },
  {
    slug: "stat-tiles",
    title: "Stat Tiles",
    componentName: "StatTiles",
    navigationGroup: "Tiles",
    description: "Horizontal row of dashboard metric stat tiles.",
    sourceFiles: ["components/StatTiles/StatTiles.tsx", "components/StatTiles/StatTiles.module.css"],
  },
] as const satisfies readonly TilesCatalogEntry[];

export type TilesControlSlug = (typeof tilesCatalog)[number]["slug"];

export function isTilesSlug(slug: string): slug is TilesControlSlug {
  return tilesCatalog.some((entry) => entry.slug === slug);
}
