"use client";

import { useMemo } from "react";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./QueryBuilder.module.css";

export type QueryOperator = "eq" | "neq" | "contains" | "gt" | "lt" | "in";
export type QueryCombinator = "and" | "or";

export type QueryRule = {
  field: string;
  id: string;
  operator: QueryOperator;
  value: string;
};

export type QueryGroup = {
  combinator: QueryCombinator;
  id: string;
  rules: QueryRule[];
};

export type QueryBuilderProps = {
  fields: string[];
  group: QueryGroup;
  onChange: (group: QueryGroup) => void;
};

const operators: { label: string; value: QueryOperator }[] = [
  { value: "eq", label: "=" },
  { value: "neq", label: "≠" },
  { value: "contains", label: "contains" },
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "in", label: "in" },
];

const operatorSymbols: Record<QueryOperator, string> = {
  eq: "=",
  neq: "≠",
  contains: "contains",
  gt: ">",
  lt: "<",
  in: "in",
};

function createRule(fields: string[]): QueryRule {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    field: fields[0] ?? "field",
    operator: "eq",
    value: "",
  };
}

function formatRule(rule: QueryRule): string {
  const value = rule.value.trim()
    ? rule.operator === "in"
      ? `(${rule.value})`
      : `"${rule.value}"`
    : "…";
  return `${rule.field} ${operatorSymbols[rule.operator]} ${value}`;
}

export function QueryBuilder({ fields, group, onChange }: QueryBuilderProps) {
  const { t } = useOpusI18n();
  function updateRule(id: string, patch: Partial<QueryRule>) {
    onChange({
      ...group,
      rules: group.rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  }

  const expression = useMemo(() => {
    if (group.rules.length === 0) return "Empty query";
    const joiner = ` ${group.combinator.toUpperCase()} `;
    const body = group.rules.map(formatRule).join(joiner);
    return group.rules.length > 1 ? `(${body})` : body;
  }, [group]);

  const payload = useMemo(
    () => ({
      combinator: group.combinator,
      rules: group.rules.map(({ field, operator, value }) => ({ field, operator, value })),
    }),
    [group],
  );

  return (
    <div className={styles.root} aria-label={t("queryBuilder.label", "Query builder")}>
      <div className={styles.toolbar}>
        <label className={styles.combinator}>
          {t("queryBuilder.match", "Match")}
          <select
            aria-label={t("queryBuilder.combinator", "Combinator")}
            className={styles.select}
            onChange={(event) => onChange({ ...group, combinator: event.target.value as QueryCombinator })}
            value={group.combinator}
          >
            <option value="and">{t("queryBuilder.allRules", "all rules (AND)")}</option>
            <option value="or">{t("queryBuilder.anyRule", "any rule (OR)")}</option>
          </select>
        </label>
        <button className={styles.add} onClick={() => onChange({ ...group, rules: [...group.rules, createRule(fields)] })} type="button">
          {t("queryBuilder.addRule", "Add rule")}
        </button>
      </div>
      {group.rules.length === 0 ? (
        <p className={styles.empty}>{t("queryBuilder.empty", "Add at least one rule to build a query.")}</p>
      ) : (
        <ul className={styles.list}>
          {group.rules.map((rule, index) => (
            <li className={styles.row} key={rule.id}>
              {index > 0 ? (
                <span className={styles.chip}>{group.combinator.toUpperCase()}</span>
              ) : (
                <span className={styles.chipSpacer} />
              )}
              <select
                aria-label={t("queryBuilder.field", "Field")}
                className={styles.select}
                onChange={(event) => updateRule(rule.id, { field: event.target.value })}
                value={rule.field}
              >
                {fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
              <select
                aria-label={t("queryBuilder.operator", "Operator")}
                className={styles.selectNarrow}
                onChange={(event) => updateRule(rule.id, { operator: event.target.value as QueryOperator })}
                value={rule.operator}
              >
                {operators.map((operator) => (
                  <option key={operator.value} value={operator.value}>
                    {operator.label}
                  </option>
                ))}
              </select>
              <input
                aria-label={t("queryBuilder.value", "Value")}
                className={styles.input}
                onChange={(event) => updateRule(rule.id, { value: event.target.value })}
                placeholder={rule.operator === "in" ? "a, b, c" : t("queryBuilder.valuePlaceholder", "Value")}
                value={rule.value}
              />
              <button
                aria-label={t("queryBuilder.removeRule", "Remove rule")}
                className={styles.remove}
                onClick={() => onChange({ ...group, rules: group.rules.filter((entry) => entry.id !== rule.id) })}
                type="button"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.output} aria-label={t("queryBuilder.output", "Query output")}>
        <div className={styles.outputLabel}>{t("queryBuilder.outputLabel", "Output")}</div>
        <p className={styles.expression}>{expression}</p>
        <pre className={styles.payload} tabIndex={0}>{JSON.stringify(payload, null, 2)}</pre>
      </div>
    </div>
  );
}
