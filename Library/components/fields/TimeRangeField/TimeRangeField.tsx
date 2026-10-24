"use client";

import { DateField } from "../DateField";
import { useOpusI18n } from "@/components/OpusI18n";
import styles from "./TimeRangeField.module.css";
import type { ControlRadius } from "../types";

export type TimeRangeValue = { start: string; end: string };
export type TimeRangeFieldProps = {
  radius?: ControlRadius;
  transparency?: import("../types").ControlTransparency;
  id: string;
  label: string;
  name?: string;
  value: TimeRangeValue;
  step?: number;
  required?: boolean;
  onChange: (value: TimeRangeValue) => void;
};

export function TimeRangeField({
  id,
  label,
  name = id,
  value,
  step = 60,
  required,
  onChange,
  radius,
}: TimeRangeFieldProps) {
  const { t } = useOpusI18n();
  const invalid = Boolean(value.start && value.end && value.end <= value.start);

  return (
    <fieldset className={styles.root} data-component="time-range-field">
      <legend className={styles.legend}>
        {label}{required ? <span className={styles.required}> {t("field.required", "(required)")}</span> : null}
      </legend>
      <div className={styles.row}>
        <DateField
          id={`${id}-start`}
          inputProps={{ step }}
          label={t("field.startTime", "Start time")}
          radius={radius}
          name={`${name}.start`}
          required={required}
          type="time"
          value={value.start}
          onChange={(event) => onChange({ ...value, start: event.target.value })}
        />
        <span className={styles.separator} aria-hidden="true">{t("field.to", "to")}</span>
        <DateField
          id={`${id}-end`}
          inputProps={{ step }}
          label={t("field.endTime", "End time")}
          radius={radius}
          name={`${name}.end`}
          required={required}
          type="time"
          value={value.end}
          onChange={(event) => onChange({ ...value, end: event.target.value })}
        />
      </div>
      {invalid ? <p className={styles.error} role="alert">{t("field.endTimeAfterStart", "End time must be after start time")}</p> : null}
    </fieldset>
  );
}
