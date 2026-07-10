"use client";

import { transform } from "@babel/standalone";
import type { ComponentType } from "react";
import { createPlaygroundScope } from "./playgroundScope";

function stripModulePreamble(code: string) {
  return code
    .replace(/^"use client";\s*\n?/m, "")
    .replace(/^import\s+[\s\S]*?;\s*$/gm, "")
    .trim();
}

export function compilePlaygroundCode(code: string): ComponentType {
  const cleaned = stripModulePreamble(code);

  if (!cleaned) {
    throw new Error("Add component code to preview it here.");
  }

  const transformed = transform(cleaned, {
    filename: "playground.tsx",
    presets: [
      ["typescript", { allExtensions: true, isTSX: true }],
      ["react", { runtime: "classic" }],
    ],
    plugins: [["transform-modules-commonjs", { allowTopLevelThis: true }]],
  });

  if (!transformed.code) {
    throw new Error("Unable to transform playground code.");
  }

  const scope = createPlaygroundScope();
  const scopeKeys = Object.keys(scope);
  const scopeValues = Object.values(scope);
  const exports: { default?: ComponentType } = {};
  const module = { exports };

  const runner = new Function(
    "exports",
    "module",
    ...scopeKeys,
    `${transformed.code}\n;return module.exports.default ?? exports.default;`,
  );

  const component = runner(exports, module, ...scopeValues) as ComponentType | undefined;
  if (!component) {
    throw new Error("Playground code must export default function Example().");
  }

  return component;
}
