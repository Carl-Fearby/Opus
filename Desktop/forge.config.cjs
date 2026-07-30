module.exports = {
  outDir: ".forge",
  packagerConfig: {
    asar: true,
    name: "Opus",
    executableName: "opus-desktop",
    icon: `${__dirname}/assets/icon`,
    extraResource: ["out"],
    prune: false,
    ignore: [
      /^\/node_modules($|\/)/,
      /^\/\.next($|\/)/,
      /^\/electron($|\/)/,
      /^\/app($|\/)/,
      /^\/lib($|\/)/,
      /^\/shared($|\/)/,
      /^\/types($|\/)/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: { name: "opus_desktop" },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: { name: "Opus" },
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
  ],
};
