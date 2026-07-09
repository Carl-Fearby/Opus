import type { PipelineStage } from "@/components/PipelineOverview";

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
