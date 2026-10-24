"use client";

import { useOpusI18n } from "@/components/OpusI18n";
import { useMemo } from "react";
import styles from "./RuleBuilder.module.css";

export type RuleEffect = "allow" | "deny" | "notify" | "route";

export type RuleDefinition = {
  conditions: string;
  effect: RuleEffect;
  enabled: boolean;
  id: string;
  name: string;
  priority: number;
};

export type RuleBuilderProps = {
  onChange: (rules: RuleDefinition[]) => void;
  rules: RuleDefinition[];
};

const effects: RuleEffect[] = ["allow", "deny", "notify", "route"];

function createRule(priority: number): RuleDefinition {
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: `Rule ${priority}`,
    conditions: "status = open",
    effect: "allow",
    enabled: true,
    priority,
  };
}

export function RuleBuilder({ onChange, rules }: RuleBuilderProps) {
  const { t } = useOpusI18n();
  function update(id: string, patch: Partial<RuleDefinition>) {
    onChange(rules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  }

  function move(id: string, direction: -1 | 1) {
    const index = rules.findIndex((rule) => rule.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= rules.length) return;
    const next = [...rules];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next.map((rule, priority) => ({ ...rule, priority: priority + 1 })));
  }

  const expression = useMemo(() => {
    const active = rules.filter((rule) => rule.enabled);
    if (active.length === 0) return "No active rules";
    return active
      .map((rule) => `#${rule.priority} IF ${rule.conditions || "…"} THEN ${rule.effect}`)
      .join(" → ");
  }, [rules]);

  const payload = useMemo(
    () =>
      rules.map(({ name, conditions, effect, enabled, priority }) => ({
        priority,
        name,
        conditions,
        effect,
        enabled,
      })),
    [rules],
  );

  return (
    <div className={styles.root} aria-label={t("ruleBuilder.label", "Rule builder")}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>{t("ruleBuilder.title", "Rules")}</div>
          <p className={styles.subtitle}>{t("ruleBuilder.subtitle", "Ordered policies evaluated from top to bottom.")}</p>
        </div>
        <button
          className={styles.add}
          onClick={() => onChange([...rules, createRule(rules.length + 1)])}
          type="button"
        >
          {t("ruleBuilder.addRule", "Add rule")}
        </button>
      </div>
      {rules.length === 0 ? (
        <p className={styles.empty}>{t("ruleBuilder.empty", "No rules yet.")}</p>
      ) : (
        <ol className={styles.list}>
          {rules.map((rule, index) => (
            <li className={styles.card} key={rule.id}>
              <div className={styles.cardTop}>
                <span className={styles.priority}>#{rule.priority}</span>
                <input
                  aria-label={t("ruleBuilder.name", "Rule name")}
                  className={styles.name}
                  onChange={(event) => update(rule.id, { name: event.target.value })}
                  value={rule.name}
                />
                <label className={styles.enabled}>
                  <input
                    checked={rule.enabled}
                    onChange={(event) => update(rule.id, { enabled: event.target.checked })}
                    type="checkbox"
                  />
                  {t("ruleBuilder.enabled", "On")}
                </label>
              </div>
              <label className={styles.field}>
                {t("ruleBuilder.when", "When")}
                <input
                  className={styles.input}
                  onChange={(event) => update(rule.id, { conditions: event.target.value })}
                  value={rule.conditions}
                />
              </label>
              <label className={styles.field}>
                {t("ruleBuilder.then", "Then")}
                <select
                  className={styles.select}
                  onChange={(event) => update(rule.id, { effect: event.target.value as RuleEffect })}
                  value={rule.effect}
                >
                  {effects.map((effect) => (
                    <option key={effect} value={effect}>
                      {effect}
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.actions}>
                <button className={styles.action} disabled={index === 0} onClick={() => move(rule.id, -1)} type="button">
                  ↑
                </button>
                <button
                  className={styles.action}
                  disabled={index === rules.length - 1}
                  onClick={() => move(rule.id, 1)}
                  type="button"
                >
                  ↓
                </button>
                <button
                  className={styles.action}
                  onClick={() =>
                    onChange(
                      rules
                        .filter((entry) => entry.id !== rule.id)
                        .map((entry, priority) => ({ ...entry, priority: priority + 1 })),
                    )
                  }
                  type="button"
                >
                  {t("ruleBuilder.remove", "Remove")}
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
      <div className={styles.output} aria-label={t("ruleBuilder.output", "Rule output")}>
        <div className={styles.outputLabel}>{t("ruleBuilder.outputLabel", "Output")}</div>
        <p className={styles.expression}>{expression}</p>
        <pre className={styles.payload} tabIndex={0}>{JSON.stringify(payload, null, 2)}</pre>
      </div>
    </div>
  );
}
