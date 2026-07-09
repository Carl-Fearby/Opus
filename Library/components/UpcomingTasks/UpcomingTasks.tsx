"use client";

import { useCallback, useState } from "react";
import { CheckboxField } from "@/components/fields";
import { DashboardListFooter } from "@/components/DashboardListWidget/DashboardListFooter";
import shared from "@/components/DashboardListWidget/shared.module.css";
import styles from "./UpcomingTasks.module.css";

export type UpcomingTaskItem = {
  completed?: boolean;
  id: string;
  subtitle: string;
  time: string;
  title: string;
};

export type UpcomingTasksProps = {
  checkboxSize?: "lg" | "md" | "sm";
  className?: string;
  footerHref?: string;
  footerLabel?: string;
  onFooterClick?: () => void;
  onTaskClick?: (task: UpcomingTaskItem) => void;
  onTaskCompleteChange?: (task: UpcomingTaskItem, completed: boolean) => void;
  tasks: UpcomingTaskItem[];
  title?: string;
};

function TaskCopy({ task }: { task: UpcomingTaskItem }) {
  return (
    <div className={styles.copy}>
      <span className={styles.itemTitle}>{task.title}</span>
      <span className={styles.itemSubtitle}>{task.subtitle}</span>
    </div>
  );
}

export function UpcomingTasks({
  checkboxSize = "md",
  className,
  footerHref,
  footerLabel = "View all tasks",
  onFooterClick,
  onTaskClick,
  onTaskCompleteChange,
  tasks,
  title = "Upcoming Tasks",
}: UpcomingTasksProps) {
  const [localCompleted, setLocalCompleted] = useState<Record<string, boolean>>({});

  const isTaskCompleted = useCallback(
    (task: UpcomingTaskItem) => task.completed ?? localCompleted[task.id] ?? false,
    [localCompleted],
  );

  const handleTaskCompleteChange = useCallback(
    (task: UpcomingTaskItem, completed: boolean) => {
      onTaskCompleteChange?.(task, completed);
      if (onTaskCompleteChange === undefined) {
        setLocalCompleted((current) => ({ ...current, [task.id]: completed }));
      }
    },
    [onTaskCompleteChange],
  );

  return (
    <div className={[styles.root, className].filter(Boolean).join(" ")}>
      <header className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
      </header>

      <ul className={[shared.list, styles.list].join(" ")}>
        {tasks.slice(0, 3).map((task) => (
          <li className={styles.item} key={task.id}>
            <CheckboxField
              checked={isTaskCompleted(task)}
              className={styles.taskCheckbox}
              fitContent
              id={`upcoming-task-${task.id}`}
              label={task.title}
              labelPosition="right"
              labelVisuallyHidden
              mode="flagged"
              onChange={(event) => handleTaskCompleteChange(task, event.target.checked)}
              shape="round"
              size={checkboxSize}
            />
            {onTaskClick ? (
              <button
                className={[styles.itemAction, shared.itemAction].join(" ")}
                onClick={() => onTaskClick(task)}
                type="button"
              >
                <TaskCopy task={task} />
                <time className={styles.time}>{task.time}</time>
              </button>
            ) : (
              <div className={styles.itemBody}>
                <TaskCopy task={task} />
                <time className={styles.time}>{task.time}</time>
              </div>
            )}
          </li>
        ))}
      </ul>

      <DashboardListFooter
        footerHref={footerHref}
        footerLabel={footerLabel}
        onFooterClick={onFooterClick}
      />
    </div>
  );
}
