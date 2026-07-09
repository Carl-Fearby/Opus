import type { UpcomingTaskItem } from "@/components/UpcomingTasks";

export const demoUpcomingTasks: UpcomingTaskItem[] = [
  {
    id: "task-1",
    completed: false,
    subtitle: "Acme Ltd • Proposal discussion",
    time: "10:30",
    title: "Follow up with Sarah Jones",
  },
  {
    id: "task-2",
    completed: false,
    subtitle: "Global Corp • Demo",
    time: "14:00",
    title: "Call with James Smith",
  },
  {
    id: "task-3",
    completed: true,
    subtitle: "Enterprise Plan • 50 users",
    time: "16:30",
    title: "Prepare quote for Initech",
  },
];
