export type UsageCode = {
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
    result = result.slice(1, -2).trim();
  } else if (result.endsWith(";")) {
    result = result.slice(0, -1).trim();
  }

  return result;
}

export function splitUsageCode(code: string): UsageCode {
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
    return { imports: trimmed, jsx: "" };
  }

  return {
    imports: lines.slice(0, jsxStart).join("\n").trim(),
    jsx: lines.slice(jsxStart).join("\n").trim(),
  };
}
