"use client";

import { Radio, RadioGroup } from "../fields/RadioGroup";
import { DateField } from "../fields/DateField";
import { NumberField } from "../fields/NumberField";
import { ChoiceChips } from "../fields/ChoiceChipsField";
import { SelectField } from "../fields/SelectField";
import { HiddenField } from "../fields/HiddenField";
import { DashboardContentContainer } from "../DashboardContentContainer";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./RecurrenceEditor.module.css";

export type RecurrenceFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type RepeatingRecurrenceValue = {
  mode?: "recurrence";
  frequency: RecurrenceFrequency;
  interval: number;
  weekdays?: number[];
  ends: "never" | "on" | "after";
  endDate?: string;
  occurrences?: number;
};
export type DateRangeRecurrenceValue = {
  mode: "date-range";
  dateFrom: string;
  dateTo: string;
};
export type RecurrenceValue = RepeatingRecurrenceValue | DateRangeRecurrenceValue;
export type RecurrenceEditorProps = {
  value: RecurrenceValue;
  onChange: (value: RecurrenceValue) => void;
};

export function RecurrenceEditor({ value, onChange }: RecurrenceEditorProps) {
  const { locale, t } = useOpusI18n();
  const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const days = Array.from({ length: 7 }, (_, index) =>
    weekdayFormatter.format(new Date(Date.UTC(2024, 0, 7 + index))),
  );
  const frequencyOptions = [
    t("recurrence.day", "day(s)"),
    t("recurrence.week", "week(s)"),
    t("recurrence.month", "month(s)"),
    t("recurrence.year", "year(s)"),
  ];
  const frequencyLabels: Record<RecurrenceFrequency, string> = {
    daily: frequencyOptions[0],
    weekly: frequencyOptions[1],
    monthly: frequencyOptions[2],
    yearly: frequencyOptions[3],
  };
  const frequenciesByLabel: Record<string, RecurrenceFrequency> = {
    [frequencyOptions[0]]: "daily",
    [frequencyOptions[1]]: "weekly",
    [frequencyOptions[2]]: "monthly",
    [frequencyOptions[3]]: "yearly",
  };
  const endOptions = [
    { label: t("recurrence.never", "Never"), value: "never" },
    { label: t("recurrence.onDate", "On date"), value: "on" },
    { label: t("recurrence.afterOccurrences", "After occurrences"), value: "after" },
  ] as const;
  const mode = value.mode === "date-range" ? "date-range" : "recurrence";
  const commit = (nextValue: RecurrenceValue) => {
    if (nextValue.mode === "date-range") {
      onChange(nextValue);
      return;
    }
    const normalized: RepeatingRecurrenceValue = { ...nextValue };
    if (normalized.frequency !== "weekly") delete normalized.weekdays;
    if (normalized.ends !== "on") delete normalized.endDate;
    if (normalized.ends !== "after") delete normalized.occurrences;
    onChange(normalized);
  };

  return (
    <DashboardContentContainer className={styles.root} data-component="recurrence-editor" width="full">
      <section className={styles.content} aria-label={t("recurrence.label", "Recurrence")}>
        <HiddenField
          id="recurrence-mode-value"
          label={t("recurrence.mode", "Recurrence mode")}
          name="recurrence.mode"
          showPreview={false}
          value={mode}
        />
        <ChoiceChips
          id="recurrence-mode"
          label={t("recurrence.scheduleType", "Schedule type")}
          labelVisuallyHidden
          options={[
            { label: t("recurrence.repeating", "Repeating"), value: "recurrence" },
            { label: t("recurrence.dateRange", "Date range"), value: "date-range" },
          ]}
          selectionMode="single"
          size="sm"
          value={mode}
          variant="outlined"
          onChange={(selected) => {
            if (selected === "date-range") {
              commit({ mode: "date-range", dateFrom: "", dateTo: "" });
            } else {
              commit({ mode: "recurrence", frequency: "weekly", interval: 1, ends: "never" });
            }
          }}
        />

        {value.mode === "date-range" ? (
          <div className={styles.dateRange}>
            <DateField
              id="recurrence-date-from"
              label={t("recurrence.from", "From")}
              name="recurrence.dateFrom"
              value={value.dateFrom}
              onChange={(event) => commit({ ...value, dateFrom: event.target.value })}
            />
            <DateField
              id="recurrence-date-to"
              label={t("recurrence.to", "To")}
              min={value.dateFrom || undefined}
              name="recurrence.dateTo"
              value={value.dateTo}
              onChange={(event) => commit({ ...value, dateTo: event.target.value })}
            />
          </div>
        ) : (
          <>
            <HiddenField
              id="recurrence-frequency-value"
              label={t("recurrence.frequencyValue", "Recurrence frequency value")}
              name="recurrence.frequency"
              showPreview={false}
              value={value.frequency}
            />
            <div className={styles.line}>
              <span>{t("recurrence.every", "Every")}</span>
              <div className={styles.intervalField}>
                <NumberField
                  id="recurrence-interval"
                  label={t("recurrence.interval", "Interval")}
                  labelVisuallyHidden
                  min={1}
                  name="recurrence.interval"
                  size="sm"
                  value={value.interval}
                  onChange={(event) => commit({ ...value, interval: event.target.valueAsNumber })}
                />
              </div>
              <div className={styles.frequencyField}>
                <SelectField
                  id="recurrence-frequency"
                  label={t("recurrence.frequency", "Frequency")}
                  labelVisuallyHidden
                  options={frequencyOptions}
                  size="sm"
                  value={frequencyLabels[value.frequency]}
                  onChange={(event) =>
                    commit({
                      ...value,
                      frequency: frequenciesByLabel[event.target.value] ?? value.frequency,
                    })
                  }
                />
              </div>
            </div>

            {value.frequency === "weekly" ? (
              <ChoiceChips
                id="recurrence-weekdays"
                label={t("recurrence.repeatOn", "Repeat on")}
                labelVisuallyHidden
                name="recurrence.weekdays"
                options={days.map((day, index) => ({ label: day, value: String(index) }))}
                selectionMode="multiple"
                size="sm"
                value={(value.weekdays ?? []).map(String)}
                variant="outlined"
                onChange={(selected) =>
                  commit({
                    ...value,
                    weekdays: (Array.isArray(selected) ? selected : [selected])
                      .map(Number)
                      .sort((left, right) => left - right),
                  })
                }
              />
            ) : null}

            <RadioGroup
              label={t("recurrence.ends", "Ends")}
              mode="stacked"
              name="recurrence.ends"
              orientation="horizontal"
              value={value.ends}
              onChange={(ends) => commit({ ...value, ends: ends as RepeatingRecurrenceValue["ends"] })}
            >
              {endOptions.map((option) => (
                <Radio key={option.value} value={option.value}>{option.label}</Radio>
              ))}
            </RadioGroup>

            {value.ends === "on" ? (
              <DateField
                id="recurrence-end-date"
                label={t("recurrence.endDate", "End date")}
                name="recurrence.endDate"
                value={value.endDate ?? ""}
                onChange={(event) => commit({ ...value, endDate: event.target.value })}
              />
            ) : null}
            {value.ends === "after" ? (
              <NumberField
                id="recurrence-occurrences"
                label={t("recurrence.occurrences", "Occurrences")}
                min={1}
                name="recurrence.occurrences"
                value={value.occurrences ?? 1}
                onChange={(event) => commit({ ...value, occurrences: event.target.valueAsNumber })}
              />
            ) : null}
          </>
        )}
      </section>
    </DashboardContentContainer>
  );
}
