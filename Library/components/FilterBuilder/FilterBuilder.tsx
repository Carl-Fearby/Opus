"use client";

import { useMemo } from "react";
import styles from "./FilterBuilder.module.css";

export type FilterOperator = "eq" | "neq" | "contains" | "gt" | "lt" | "empty";

export type FilterCondition = {
  field: string;
  id: string;
  operator: FilterOperator;
  value: string;
};

export type FilterBuilderProps = {
  conditions: FilterCondition[];
  fields: string[];
  onChange: (conditions: FilterCondition[]) => void;
};

const operators: { label: string; value: FilterOperator }[] = [
  { value: "eq", label: "equals" },
  { value: "neq", label: "not equals" },
  { value: "contains", label: "contains" },
  { value: "gt", label: "greater than" },
  { value: "lt", label: "less than" },
  { value: "empty", label: "is empty" },
];

const operatorSymbols: Record<FilterOperator, string> = {
  eq: "=",
  neq: "≠",
  contains: "contains",
  gt: ">",
  lt: "<",
  empty: "is empty",
};

function createCondition(fields: string[]): FilterCondition {
  return {
    id: `filter-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    field: fields[0] ?? "field",
    operator: "eq",
    value: "",
  };
}

function formatCondition(condition: FilterCondition): string {
  if (condition.operator === "empty") {
    return `${condition.field} is empty`;
  }
  const value = condition.value.trim() ? `"${condition.value}"` : "…";
  return `${condition.field} ${operatorSymbols[condition.operator]} ${value}`;
}

export function FilterBuilder({ conditions, fields, onChange }: FilterBuilderProps) {
  function update(id: string, patch: Partial<FilterCondition>) {
    onChange(conditions.map((condition) => (condition.id === id ? { ...condition, ...patch } : condition)));
  }

  const expression = useMemo(() => {
    if (conditions.length === 0) return "No filters applied";
    return conditions.map(formatCondition).join(" AND ");
  }, [conditions]);

  const payload = useMemo(
    () =>
      conditions.map(({ field, operator, value }) =>
        operator === "empty" ? { field, operator } : { field, operator, value },
      ),
    [conditions],
  );

  return (
    <div className={styles.root} aria-label="Filter builder">
      <div className={styles.header}>
        <span className={styles.title}>Filters</span>
        <button className={styles.add} onClick={() => onChange([...conditions, createCondition(fields)])} type="button">
          Add filter
        </button>
      </div>
      {conditions.length === 0 ? (
        <p className={styles.empty}>No filters. Add one to narrow results.</p>
      ) : (
        <ul className={styles.list}>
          {conditions.map((condition, index) => (
            <li className={styles.row} key={condition.id}>
              {index > 0 ? <span className={styles.joiner}>AND</span> : <span className={styles.joinerSpacer} />}
              <select
                aria-label="Field"
                className={styles.select}
                onChange={(event) => update(condition.id, { field: event.target.value })}
                value={condition.field}
              >
                {fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
              <select
                aria-label="Operator"
                className={styles.select}
                onChange={(event) => update(condition.id, { operator: event.target.value as FilterOperator })}
                value={condition.operator}
              >
                {operators.map((operator) => (
                  <option key={operator.value} value={operator.value}>
                    {operator.label}
                  </option>
                ))}
              </select>
              {condition.operator === "empty" ? (
                <span className={styles.valuePlaceholder}>—</span>
              ) : (
                <input
                  aria-label="Value"
                  className={styles.input}
                  onChange={(event) => update(condition.id, { value: event.target.value })}
                  placeholder="Value"
                  value={condition.value}
                />
              )}
              <button
                aria-label="Remove filter"
                className={styles.remove}
                onClick={() => onChange(conditions.filter((entry) => entry.id !== condition.id))}
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.output} aria-label="Filter output">
        <div className={styles.outputLabel}>Output</div>
        <p className={styles.expression}>{expression}</p>
        <pre className={styles.payload}>{JSON.stringify(payload, null, 2)}</pre>
      </div>
    </div>
  );
}
