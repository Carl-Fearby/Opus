import type { PipelineStage } from "opus-react";
import type { ControlSettingsBySlug } from "./types";

export const demoPipelineStages: PipelineStage[] = [
  {
    id: "qualification",
    label: "Qualification",
    value: 842000,
    displayValue: "£842,000",
    percentage: 34,
  },
  {
    id: "proposal",
    label: "Proposal",
    value: 621000,
    displayValue: "£621,000",
    percentage: 25,
  },
  {
    id: "negotiation",
    label: "Negotiation",
    value: 542000,
    displayValue: "£542,000",
    percentage: 22,
  },
  {
    id: "closing",
    label: "Closing",
    value: 331000,
    displayValue: "£331,000",
    percentage: 13,
  },
  {
    id: "won",
    label: "Won",
    value: 144000,
    displayValue: "£144,000",
    percentage: 6,
  },
];

export const demoPipelineTotalValue = "£2,480,000";

export function parsePipelineStageCount(value: string | undefined) {
  const count = Number(value);
  if (!Number.isFinite(count)) {
    return demoPipelineStages.length;
  }

  return Math.min(demoPipelineStages.length, Math.max(1, Math.round(count)));
}

function parseCurrencySetting(value: string) {
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatCurrencySetting(value: number) {
  return new Intl.NumberFormat("en-GB", {
    currency: "GBP",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function normalizePercentages(values: number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return values.map(() => 0);
  }

  const exact = values.map((value) => (value / total) * 100);
  const rounded = exact.map((value) => Math.floor(value));
  let remainder = 100 - rounded.reduce((sum, value) => sum + value, 0);
  const ranked = exact
    .map((value, index) => ({ index, remainder: value - rounded[index] }))
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < ranked.length && remainder > 0; i += 1) {
    rounded[ranked[i].index] += 1;
    remainder -= 1;
  }

  return rounded;
}

export function buildPipelineStagesFromSettings(settings: ControlSettingsBySlug["pipeline-overview"]) {
  const stageCount = parsePipelineStageCount(settings.stageCount);
  const stageValues = [
    parseCurrencySetting(settings.qualificationValue),
    parseCurrencySetting(settings.proposalValue),
    parseCurrencySetting(settings.negotiationValue),
    parseCurrencySetting(settings.closingValue),
    parseCurrencySetting(settings.wonValue),
  ].slice(0, stageCount);
  const percentages = normalizePercentages(stageValues);

  return demoPipelineStages.slice(0, stageCount).map((stage, index) => ({
    ...stage,
    displayValue: formatCurrencySetting(stageValues[index] ?? 0),
    percentage: percentages[index] ?? 0,
    value: stageValues[index] ?? 0,
  }));
}

export function formatPipelineStagesForUsage(settings: ControlSettingsBySlug["pipeline-overview"]) {
  return JSON.stringify(buildPipelineStagesFromSettings(settings), null, 2);
}

export function formatPipelineTotalValue(settings: ControlSettingsBySlug["pipeline-overview"]) {
  const stages = buildPipelineStagesFromSettings(settings);
  const total = stages.reduce((sum, stage) => sum + stage.value, 0);
  return settings.totalValue || formatCurrencySetting(total) || demoPipelineTotalValue;
}
