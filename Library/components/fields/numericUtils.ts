export function decimalPlacesFromStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) {
    return 0;
  }

  if (Number.isInteger(step)) {
    return 0;
  }

  const stepText = step.toString().toLowerCase();
  if (stepText.includes("e-")) {
    const [, exponent] = stepText.split("e-");
    return Number(exponent) || 0;
  }

  const dotIndex = stepText.indexOf(".");
  if (dotIndex === -1) {
    return 0;
  }

  return stepText.length - dotIndex - 1;
}

export function formatByStep(value: number, step: number): string {
  return value.toFixed(decimalPlacesFromStep(step));
}

export function roundToStep(value: number, step: number, min = 0): number {
  if (!Number.isFinite(value) || !Number.isFinite(step) || step <= 0) {
    return value;
  }

  const decimals = decimalPlacesFromStep(step);
  const stepped = Math.round((value - min) / step) * step + min;
  return Number(stepped.toFixed(decimals));
}
