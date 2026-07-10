import type { NotesActivityItem } from "opus-react";

export const demoNotesActivity: NotesActivityItem[] = [
  {
    id: "note-1",
    author: "Carl Fearby",
    body: "Spoke with Sarah about the new pricing structure. She requested a custom solution for 50+ users.",
    dateGroup: "Today",
    kind: "note",
    tags: [
      { label: "Pricing", tone: "purple" },
      { label: "Enterprise", tone: "orange" },
    ],
    time: "10:15",
  },
  {
    id: "note-2",
    author: "Emma Davis",
    body: "Logged a call with James Smith. Discussed implementation timeline and requirements.",
    dateGroup: "Today",
    kind: "activity",
    status: "success",
    tags: [{ label: "Call", tone: "green" }],
    time: "09:42",
  },
  {
    id: "note-3",
    author: "Michael Brown",
    body: "Deal moved to Negotiation. Initech • £18,000",
    dateGroup: "Yesterday",
    kind: "activity",
    status: "warning",
    tags: [{ label: "Deal", tone: "purple" }],
    time: "16:30",
  },
  {
    id: "note-4",
    author: "Olivia Wilson",
    body: "Sent proposal to Global Corp. Waiting for feedback.",
    dateGroup: "Yesterday",
    kind: "activity",
    status: "muted",
    tags: [{ label: "Email", tone: "blue" }],
    time: "14:20",
  },
];
