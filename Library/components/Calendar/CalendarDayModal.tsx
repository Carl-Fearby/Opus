"use client";

import { useOpusI18n } from "@/components/OpusI18n";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/fields/Button";
import { DateField } from "@/components/fields/DateField";
import { SelectField } from "@/components/fields/SelectField";
import { TextField } from "@/components/fields/TextField";
import { Modal } from "@/components/Modal";
import { formatEventTimeRange, sortEventsByTime } from "./calendarTime";
import type { CalendarEvent } from "./Calendar";
import styles from "./Calendar.module.css";

type CalendarDayModalProps = {
  dateKey: string | null;
  events: CalendarEvent[];
  onBookEvent: (event: CalendarEvent) => void;
  onClose: () => void;
};

const toneOptions = ["Meeting", "Success", "Reminder", "Incident"] as const;

const toneByLabel: Record<(typeof toneOptions)[number], NonNullable<CalendarEvent["tone"]>> = {
  Meeting: "accent",
  Success: "success",
  Reminder: "warning",
  Incident: "danger",
};

function formatDayLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function CalendarDayModal({ dateKey, events, onBookEvent, onClose }: CalendarDayModalProps) {
  const { t } = useOpusI18n();
  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [toneLabel, setToneLabel] = useState<(typeof toneOptions)[number]>("Meeting");
  const [notice, setNotice] = useState<string | null>(null);
  const scheduledEvents = useMemo(() => sortEventsByTime(events), [events]);

  useEffect(() => {
    setTitle("");
    setStartTime("09:00");
    setEndTime("10:00");
    setToneLabel("Meeting");
    setNotice(null);
  }, [dateKey]);

  function handleBook() {
    if (!dateKey || !title.trim()) {
      return;
    }

    const nextTitle = title.trim();
    onBookEvent({
      date: dateKey,
      endTime,
      id: `booked-${Date.now()}`,
      startTime,
      title: nextTitle,
      tone: toneByLabel[toneLabel],
    });
    setTitle("");
    setNotice(
      t("calendar.eventAdded", '"{title}" was added to this day.', { title: nextTitle }),
    );
  }

  return (
    <Modal
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.close", "Close")}
          </Button>
          <Button disabled={!title.trim()} variant="primary" onClick={handleBook}>
            {t("calendar.addEvent", "Add event")}
          </Button>
        </>
      }
      description={t(
        "calendar.dayModalDescription",
        "Review scheduled items or book a new event.",
      )}
      onClose={onClose}
      open={Boolean(dateKey)}
      size="medium"
      title={dateKey ? formatDayLabel(dateKey) : t("calendar.dayDetails", "Day details")}
    >
      <div className={styles.dayModal}>
        <section className={styles.dayModalSection}>
          <h3 className={styles.dayModalHeading}>{t("calendarDay.scheduled", "Scheduled")}</h3>
          {scheduledEvents.length > 0 ? (
            <ul className={styles.dayModalList}>
              {scheduledEvents.map((event) => {
                const timeRange = formatEventTimeRange(event.startTime, event.endTime);
                return (
                  <li className={styles.dayModalItem} data-tone={event.tone ?? "accent"} key={event.id}>
                    <span aria-hidden="true" className={styles.dayModalDot} data-tone={event.tone ?? "accent"} />
                    <div className={styles.dayModalItemBody}>
                      {timeRange ? <span className={styles.dayModalItemTime}>{timeRange}</span> : null}
                      <span className={styles.dayModalItemTitle}>{event.title}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.dayModalEmpty}>{t("calendarDay.noEvents", "No events scheduled for this day.")}</p>
          )}
        </section>

        <section className={styles.dayModalSection}>
          <h3 className={styles.dayModalHeading}>{t("calendarDay.book", "Book an event")}</h3>
          <div className={styles.dayModalForm}>
            <TextField
              id="calendar-day-event-title"
              label="Title"
              mode="stacked"
              placeholder={t("calendarDay.placeholder", "Team sync, incident review…")}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <div className={styles.dayModalFieldRow}>
              <DateField
                id="calendar-day-event-start"
                label="From"
                mode="stacked"
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
              />
              <DateField
                id="calendar-day-event-end"
                label="To"
                mode="stacked"
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
              />
            </div>
            <SelectField
              id="calendar-day-event-type"
              label="Type"
              mode="stacked"
              options={[...toneOptions]}
              value={toneLabel}
              onChange={(event) => setToneLabel(event.target.value as (typeof toneOptions)[number])}
            />
          </div>
          {notice ? <p className={styles.dayModalNotice}>{notice}</p> : null}
        </section>
      </div>
    </Modal>
  );
}
