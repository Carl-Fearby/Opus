export type UsageCode = {
  full: string;
  imports: string;
  jsx: string;
};

function normalizeJsx(jsx: string): string {
  let result = jsx.trim();

  if (result.endsWith("}")) {
    result = result.slice(0, -1).trim();
  }

  if (result.startsWith("return ")) {
    result = result.slice(7).trim();
  }

  if (result.startsWith("(") && result.endsWith(");")) {
    result = stripCommonIndent(result.slice(1, -2)).trim();
  } else if (result.endsWith(";")) {
    result = result.slice(0, -1).trim();
  }

  return result;
}

function stripCommonIndent(value: string): string {
  const lines = value.replace(/^\n/, "").replace(/\n\s*$/, "").split("\n");
  const indentedLines = lines.filter((line) => line.trim());

  if (!indentedLines.length) {
    return "";
  }

  const indent = Math.min(...indentedLines.map((line) => line.match(/^\s*/)?.[0].length ?? 0));

  if (!indent) {
    return lines.join("\n");
  }

  return lines.map((line) => (line.trim() ? line.slice(indent) : line)).join("\n");
}

function indentBlock(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line ? `${pad}${line}` : line))
    .join("\n");
}

function splitModuleAndFunctionLines(header: string) {
  const moduleLines: string[] = [];
  const functionLines: string[] = [];

  for (const line of header.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed === '"use client";' || trimmed.startsWith("import ") || trimmed.startsWith("//")) {
      moduleLines.push(line);
      continue;
    }

    functionLines.push(line);
  }

  return { functionLines, moduleLines };
}

function splitUsageCodeParts(code: string): Pick<UsageCode, "imports" | "jsx"> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { imports: "", jsx: "" };
  }

  const returnIndex = trimmed.search(/\n\s*return\s+/);
  if (returnIndex !== -1) {
    return {
      imports: trimmed.slice(0, returnIndex).trim(),
      jsx: normalizeJsx(trimmed.slice(returnIndex + 1).trim()),
    };
  }

  const lines = trimmed.split("\n");
  let jsxStart = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmedLine = line.trim();

    if (!trimmedLine.startsWith("<")) {
      continue;
    }

    if (/^<\/?[A-Za-z]/.test(trimmedLine) && !line.startsWith(" ") && !line.startsWith("\t")) {
      jsxStart = index;
      break;
    }
  }

  if (jsxStart === -1) {
    for (let index = 0; index < lines.length; index += 1) {
      const trimmedLine = lines[index].trim();
      if (/^<[A-Za-z]/.test(trimmedLine)) {
        jsxStart = index;
        break;
      }
    }
  }

  if (jsxStart === -1) {
    return {
      imports: trimmed,
      jsx: "",
    };
  }

  return {
    imports: lines.slice(0, jsxStart).join("\n").trim(),
    jsx: lines.slice(jsxStart).join("\n").trim(),
  };
}

function formatReturnBody(returnBody: string): string {
  const trimmed = returnBody.trim().replace(/;$/, "");

  if (trimmed.startsWith("(") && trimmed.endsWith(")")) {
    const inner = stripCommonIndent(trimmed.slice(1, -1).trim());
    if (!inner) {
      return "()";
    }

    return `(\n${indentBlock(inner, 4)}\n  )`;
  }

  if (trimmed.startsWith("<")) {
    return `(\n${indentBlock(trimmed, 4)}\n  )`;
  }

  return trimmed;
}

export function formatFullUsageComponent(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) {
    return "";
  }

  if (/export\s+default\s+function/.test(trimmed)) {
    return trimmed;
  }

  const returnIndex = trimmed.search(/\n\s*return\s+/);
  if (returnIndex !== -1) {
    const header = trimmed.slice(0, returnIndex).trim();
    const returnStatement = trimmed.slice(returnIndex + 1).trim();
    const returnBody = returnStatement
      .replace(/^return\s+/, "")
      .trim()
      .replace(/;$/, "");
    const { functionLines, moduleLines } = splitModuleAndFunctionLines(header);
    const functionBody = functionLines.map((line) => `  ${line}`).join("\n");

    return `${moduleLines.join("\n")}\n\nexport default function Example() {\n${functionBody}${functionBody ? "\n" : ""}  return ${formatReturnBody(returnBody)};\n}`;
  }

  const split = splitUsageCodeParts(trimmed);
  if (!split.jsx) {
    return trimmed;
  }

  const { functionLines, moduleLines } = splitModuleAndFunctionLines(split.imports);
  const functionBody = functionLines.map((line) => `  ${line}`).join("\n");

  return `${moduleLines.join("\n")}\n\nexport default function Example() {\n${functionBody}${functionBody ? "\n" : ""}  return (\n${indentBlock(split.jsx.trim(), 4)}\n  );\n}`;
}

export function splitUsageCode(code: string): UsageCode {
  const split = splitUsageCodeParts(code);

  return {
    ...split,
    full: formatFullUsageComponent(code),
  };
}
