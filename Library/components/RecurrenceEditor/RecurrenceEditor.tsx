"use client";

import { Radio, RadioGroup } from "../fields/RadioGroup";
import { DateField } from "../fields/DateField";
import { NumberField } from "../fields/NumberField";
import { ChoiceChips } from "../fields/ChoiceChipsField";
import { SelectField } from "../fields/SelectField";
import { HiddenField } from "../fields/HiddenField";
import { DashboardContentContainer } from "../DashboardContentContainer";
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

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const frequencyOptions = ["day(s)", "week(s)", "month(s)", "year(s)"];
const frequencyLabels: Record<RecurrenceFrequency, string> = {
  daily: "day(s)",
  weekly: "week(s)",
  monthly: "month(s)",
  yearly: "year(s)",
};
const frequenciesByLabel: Record<string, RecurrenceFrequency> = {
  "day(s)": "daily",
  "week(s)": "weekly",
  "month(s)": "monthly",
  "year(s)": "yearly",
};
const endOptions = [
  { label: "Never", value: "never" },
  { label: "On date", value: "on" },
  { label: "After occurrences", value: "after" },
] as const;

export function RecurrenceEditor({ value, onChange }: RecurrenceEditorProps) {
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
      <section className={styles.content} aria-label="Recurrence">
        <HiddenField
          id="recurrence-mode-value"
          label="Recurrence mode"
          name="recurrence.mode"
          showPreview={false}
          value={mode}
        />
        <ChoiceChips
          id="recurrence-mode"
          label="Schedule type"
          labelVisuallyHidden
          options={[
            { label: "Repeating", value: "recurrence" },
            { label: "Date range", value: "date-range" },
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
              label="From"
              name="recurrence.dateFrom"
              value={value.dateFrom}
              onChange={(event) => commit({ ...value, dateFrom: event.target.value })}
            />
            <DateField
              id="recurrence-date-to"
              label="To"
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
              label="Recurrence frequency value"
              name="recurrence.frequency"
              showPreview={false}
              value={value.frequency}
            />
            <div className={styles.line}>
              <span>Every</span>
              <div className={styles.intervalField}>
                <NumberField
                  id="recurrence-interval"
                  label="Interval"
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
                  label="Frequency"
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
                label="Repeat on"
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
              label="Ends"
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
                label="End date"
                name="recurrence.endDate"
                value={value.endDate ?? ""}
                onChange={(event) => commit({ ...value, endDate: event.target.value })}
              />
            ) : null}
            {value.ends === "after" ? (
              <NumberField
                id="recurrence-occurrences"
                label="Occurrences"
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
