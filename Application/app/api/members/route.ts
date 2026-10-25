/**
 * Mock member directory used by the Kanban member picker demo.
 *
 * It behaves like the real endpoint the component is expected to call:
 * `GET /api/members?q=<query>` returns active users matching the query on
 * name or role. Swap this route for your own implementation without touching
 * the component — KanbanBoard only sees the `onSearchMembers` callback.
 */

type DirectoryUser = {
  id: string;
  name: string;
  role: string;
  color: string;
  active: boolean;
};

const directory: DirectoryUser[] = [
  { id: "m1", name: "Emma Davis", role: "Design", color: "#ec4899", active: true },
  { id: "m2", name: "Michael Brown", role: "Engineering", color: "#0ea5e9", active: true },
  { id: "m3", name: "Priya Nair", role: "Product", color: "#8b5cf6", active: true },
  { id: "m4", name: "Sofia Alvarez", role: "Design", color: "#f59e0b", active: true },
  { id: "m5", name: "Tom Whitfield", role: "Engineering", color: "#10b981", active: true },
  { id: "m6", name: "Aisha Rahman", role: "Support", color: "#ef4444", active: true },
  { id: "m7", name: "Lucas Meyer", role: "Engineering", color: "#06b6d4", active: true },
  { id: "m8", name: "Hannah Schmidt", role: "Marketing", color: "#f97316", active: true },
  { id: "m9", name: "Kenji Tanaka", role: "Data", color: "#14b8a6", active: true },
  { id: "m10", name: "Maria Costa", role: "Product", color: "#a855f7", active: true },
  { id: "m11", name: "Daniel Osei", role: "Engineering", color: "#3b82f6", active: true },
  { id: "m12", name: "Elena Petrova", role: "QA", color: "#84cc16", active: true },
  { id: "m13", name: "Noah Fischer", role: "Support", color: "#e11d48", active: true },
  { id: "m14", name: "Grace Kim", role: "Design", color: "#0ea5e9", active: true },
  { id: "m15", name: "Oliver Hughes", role: "Sales", color: "#f59e0b", active: true },
  { id: "m16", name: "Fatima Zahra", role: "Data", color: "#8b5cf6", active: true },
  { id: "m17", name: "Jonas Lindqvist", role: "Engineering", color: "#10b981", active: true },
  { id: "m18", name: "Chloe Bennett", role: "Marketing", color: "#ec4899", active: true },
  { id: "m19", name: "Rafael Mendes", role: "Sales", color: "#06b6d4", active: true },
  { id: "m20", name: "Ingrid Olsen", role: "QA", color: "#f97316", active: true },
  { id: "m21", name: "Sam Carter", role: "Engineering", color: "#64748b", active: false },
  { id: "m22", name: "Laura Quinn", role: "Support", color: "#64748b", active: false },
];

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";

  const matches = directory.filter((user) => {
    if (!user.active) return false;
    if (!query) return true;
    return `${user.name} ${user.role}`.toLowerCase().includes(query);
  });

  return Response.json(
    matches.slice(0, PAGE_SIZE).map(({ id, name, role, color }) => ({ id, name, role, color })),
  );
}
