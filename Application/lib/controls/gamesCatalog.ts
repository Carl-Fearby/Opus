export type GamesCatalogEntry = {
  componentName: string;
  description: string;
  navigationGroup?: string;
  slug: string;
  sourceFiles: string[];
  title: string;
};

export const gamesCatalog = [
  {
    slug: "jet-set-willy",
    title: "Jet Set Willy",
    componentName: "JetSetWilly",
    description:
      "Native TypeScript and canvas edition built from the supplied licensed game's original rooms, graphics, items and guardian data.",
    navigationGroup: "Platform",
    sourceFiles: [
      "components/JetSetWilly/JetSetWilly.tsx",
      "components/JetSetWilly/JetSetWillyEngine.ts",
      "components/JetSetWilly/JetSetWilly.module.css",
      "components/JetSetWilly/jetSetWillyData.ts",
    ],
  },
  {
    slug: "asteroids",
    title: "Asteroids Game",
    componentName: "Asteroids",
    description:
      "Classic vector-style space survival game with responsive canvas rendering, keyboard and touch controls, scoring, lives, progressive waves, and arcade sound effects.",
    navigationGroup: "Arcade",
    sourceFiles: [
      "components/Asteroids/Asteroids.tsx",
      "components/Asteroids/Asteroids.module.css",
    ],
  },
  {
    slug: "pac-man",
    title: "Pac-Man Game",
    componentName: "PacMan",
    description:
      "Playable canvas arcade game with keyboard, pointer, and touch controls, multiple mazes, scoring, lives, and level progression.",
    navigationGroup: "Arcade",
    sourceFiles: [
      "components/PacMan/PacMan.tsx",
      "components/PacMan/PacMan.module.css",
      "components/PacMan/PacmanEngine.ts",
      "components/PacMan/Joystick.tsx",
      "components/PacMan/Joystick.module.css",
    ],
  },
] as const satisfies readonly GamesCatalogEntry[];

export type GamesControlSlug = (typeof gamesCatalog)[number]["slug"];
