"use client";

import { useMemo } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
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

const operators: { labelKey: string; fallback: string; value: FilterOperator }[] = [
  { value: "eq", labelKey: "filter.equals", fallback: "equals" },
  { value: "neq", labelKey: "filter.notEquals", fallback: "not equals" },
  { value: "contains", labelKey: "filter.contains", fallback: "contains" },
  { value: "gt", labelKey: "filter.greaterThan", fallback: "greater than" },
  { value: "lt", labelKey: "filter.lessThan", fallback: "less than" },
  { value: "empty", labelKey: "filter.isEmpty", fallback: "is empty" },
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

function formatCondition(
  condition: FilterCondition,
  t: (key: string, fallback: string) => string,
): string {
  if (condition.operator === "empty") {
    return `${condition.field} ${t("filter.isEmpty", "is empty")}`;
  }
  const value = condition.value.trim() ? `"${condition.value}"` : "…";
  const symbol =
    condition.operator === "contains"
      ? t("filter.contains", "contains")
      : operatorSymbols[condition.operator];
  return `${condition.field} ${symbol} ${value}`;
}

export function FilterBuilder({ conditions, fields, onChange }: FilterBuilderProps) {
  const { t } = useOpusI18n();
  function update(id: string, patch: Partial<FilterCondition>) {
    onChange(conditions.map((condition) => (condition.id === id ? { ...condition, ...patch } : condition)));
  }

  const expression = useMemo(() => {
    if (conditions.length === 0) return t("filter.noFiltersApplied", "No filters applied");
    return conditions.map((condition) => formatCondition(condition, t)).join(` ${t("filter.and", "AND")} `);
  }, [conditions, t]);

  const payload = useMemo(
    () =>
      conditions.map(({ field, operator, value }) =>
        operator === "empty" ? { field, operator } : { field, operator, value },
      ),
    [conditions],
  );

  return (
    <div className={styles.root} aria-label={t("filter.builder", "Filter builder")}>
      <div className={styles.header}>
        <span className={styles.title}>{t("filter.filters", "Filters")}</span>
        <button className={styles.add} onClick={() => onChange([...conditions, createCondition(fields)])} type="button">
          {t("filter.addFilter", "Add filter")}
        </button>
      </div>
      {conditions.length === 0 ? (
        <p className={styles.empty}>{t("filter.noFilters", "No filters. Add one to narrow results.")}</p>
      ) : (
        <ul className={styles.list}>
          {conditions.map((condition, index) => (
            <li className={styles.row} key={condition.id}>
              {index > 0 ? <span className={styles.joiner}>{t("filter.and", "AND")}</span> : <span className={styles.joinerSpacer} />}
              <select
                aria-label={t("filter.field", "Field")}
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
                aria-label={t("filter.operator", "Operator")}
                className={styles.select}
                onChange={(event) => update(condition.id, { operator: event.target.value as FilterOperator })}
                value={condition.operator}
              >
                {operators.map((operator) => (
                  <option key={operator.value} value={operator.value}>
                    {t(operator.labelKey, operator.fallback)}
                  </option>
                ))}
              </select>
              {condition.operator === "empty" ? (
                <span className={styles.valuePlaceholder}>—</span>
              ) : (
                <input
                  aria-label={t("filter.value", "Value")}
                  className={styles.input}
                  onChange={(event) => update(condition.id, { value: event.target.value })}
                  placeholder={t("filter.value", "Value")}
                  value={condition.value}
                />
              )}
              <button
                aria-label={t("filter.removeFilter", "Remove filter")}
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
      <div className={styles.output} aria-label={t("filter.output", "Filter output")}>
        <div className={styles.outputLabel}>{t("filter.output", "Output")}</div>
        <p className={styles.expression}>{expression}</p>
        <pre className={styles.payload} tabIndex={0}>{JSON.stringify(payload, null, 2)}</pre>
      </div>
    </div>
  );
}
