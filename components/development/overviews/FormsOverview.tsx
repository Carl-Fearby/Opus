"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import {
  Button,
  CheckboxField,
  ColorField,
  DateField,
  FileField,
  HiddenField,
  NumberField,
  Radio,
  RadioGroup,
  RangeField,
  SelectField,
  SwitchField,
  TextAreaField,
  TextField,
  type ChoiceShape,
  type LabelPosition,
} from "@/components/fields";
import { getControlsByCategory } from "@/lib/controls/registry";
import { componentPath } from "@/lib/controls/routes";
import type { ControlSlug } from "@/lib/controls/types";
import styles from "./overview.module.css";

const radioValues = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
  { label: "Enterprise", value: "enterprise" },
];

type SharedFieldOptions = {
  checkboxShape: ChoiceShape;
  errorText: (value: string) => string | undefined;
  labelPosition: LabelPosition;
  mode: "flagged" | "stacked";
  radioShape: ChoiceShape;
};

export function FormsOverview() {
  useSetComponentsPageHeader(
    "Forms",
    "Live previews of every form component. Adjust shared settings below or open a component for full control.",
  );

  const [flagged, setFlagged] = useState(false);
  const [labelDirection, setLabelDirection] = useState<LabelPosition>("left");
  const [radioShape, setRadioShape] = useState<ChoiceShape>("round");
  const [checkboxShape, setCheckboxShape] = useState<ChoiceShape>("square");
  const [errorsOn, setErrorsOn] = useState(false);

  const [fullName, setFullName] = useState("Jane Cooper");
  const [email, setEmail] = useState("jane.cooper@example.com");
  const [password, setPassword] = useState("hunter2!");
  const [telephone, setTelephone] = useState("+44 7700 900123");
  const [website, setWebsite] = useState("https://example.com");
  const [search, setSearch] = useState("Search query");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("Select a country");
  const [birthDate, setBirthDate] = useState("1990-05-24");
  const [startTime, setStartTime] = useState("09:30");
  const [appointment, setAppointment] = useState("1990-05-24T09:30");
  const [billingMonth, setBillingMonth] = useState("1990-05");
  const [planningWeek, setPlanningWeek] = useState("1990-W21");
  const [accountType, setAccountType] = useState("personal");
  const [agree, setAgree] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState(60);
  const [quantity, setQuantity] = useState(3);
  const [fileName, setFileName] = useState("");
  const [accentColor, setAccentColor] = useState("#6D2BD9");

  const mode = flagged ? "flagged" : "stacked";
  const labelPosition = labelDirection;
  const errorText = (value: string) => (errorsOn ? value : undefined);
  const shared: SharedFieldOptions = { checkboxShape, errorText, labelPosition, mode, radioShape };

  const demos: Partial<Record<ControlSlug, ReactNode>> = {
    button: <Button variant="primary">Button</Button>,
    "submit-button": (
      <Button type="submit" variant="primary">
        Submit
      </Button>
    ),
    "reset-button": (
      <Button type="reset" variant="secondary">
        Reset
      </Button>
    ),
    checkbox: (
      <CheckboxField
        id="overview-checkbox"
        label="I agree to the Terms & Conditions"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("You must agree to continue")}
        shape={shared.checkboxShape}
        checked={agree}
        onChange={(event) => setAgree(event.target.checked)}
      />
    ),
    switch: (
      <SwitchField
        id="overview-switch"
        label="Enable notifications"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("You must enable notifications")}
        checked={notifications}
        onChange={(event) => setNotifications(event.target.checked)}
      />
    ),
    "radio-group": (
      <RadioGroup
        id="overview-radio-group"
        name="overview-radio-group"
        label="Account type"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select an account type")}
        shape={shared.radioShape}
        value={accountType}
        onChange={setAccountType}
      >
        {radioValues.map((option) => (
          <Radio key={option.value} value={option.value} error={errorsOn ? "This option needs review" : undefined}>
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
    ),
    "color-picker": (
      <ColorField
        id="overview-color-picker"
        label="Choose a colour"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a colour")}
        value={accentColor}
        onChange={(event) => setAccentColor(event.target.value)}
      />
    ),
    "date-picker": (
      <DateField
        id="overview-date-picker"
        label="Date of birth"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a date")}
        type="date"
        value={birthDate}
        onChange={(event) => setBirthDate(event.target.value)}
      />
    ),
    "time-picker": (
      <DateField
        id="overview-time-picker"
        label="Start time"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a time")}
        type="time"
        value={startTime}
        onChange={(event) => setStartTime(event.target.value)}
      />
    ),
    "datetime-picker": (
      <DateField
        id="overview-datetime-picker"
        label="Appointment"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a date and time")}
        type="datetime-local"
        value={appointment}
        onChange={(event) => setAppointment(event.target.value)}
      />
    ),
    "month-picker": (
      <DateField
        id="overview-month-picker"
        label="Billing month"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a month")}
        type="month"
        value={billingMonth}
        onChange={(event) => setBillingMonth(event.target.value)}
      />
    ),
    "week-picker": (
      <DateField
        id="overview-week-picker"
        label="Planning week"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a week")}
        type="week"
        value={planningWeek}
        onChange={(event) => setPlanningWeek(event.target.value)}
      />
    ),
    "email-input": (
      <TextField
        id="overview-email-input"
        label="Email address"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Enter a valid email address")}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
    ),
    "telephone-input": (
      <TextField
        id="overview-telephone-input"
        label="Phone number"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Enter a valid phone number")}
        type="tel"
        value={telephone}
        onChange={(event) => setTelephone(event.target.value)}
      />
    ),
    "url-input": (
      <TextField
        id="overview-url-input"
        label="Website"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Enter a valid URL")}
        type="url"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
      />
    ),
    "search-input": (
      <TextField
        id="overview-search-input"
        label="Search"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Enter a search term")}
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    ),
    "file-upload": (
      <FileField
        id="overview-file-upload"
        label="Upload a file"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please upload a file (Max 10MB)")}
        fileName={fileName}
        onChange={(event) => {
          setFileName(event.target.files?.[0]?.name ?? "");
        }}
      />
    ),
    "hidden-input": (
      <HiddenField
        id="overview-hidden-input"
        label="Campaign ID"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        name="campaignId"
        value="campaign-id-42"
      />
    ),
    "number-input": (
      <NumberField
        id="overview-number-input"
        label="Quantity"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please enter a value between 1 and 100")}
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value) || 0)}
      />
    ),
    "password-input": (
      <TextField
        id="overview-password-input"
        label="Password"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Must be at least 8 characters")}
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
    ),
    "range-slider": (
      <RangeField
        id="overview-range-slider"
        label="Volume"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a value")}
        value={volume}
        onChange={(event) => setVolume(Number(event.target.value))}
      />
    ),
    select: (
      <SelectField
        id="overview-select"
        label="Country"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a country")}
        value={country}
        options={["Select a country", "United Kingdom", "United States", "Canada"]}
        onChange={(event) => setCountry(event.target.value)}
      />
    ),
    "text-input": (
      <TextField
        id="overview-text-input"
        label="Full name"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("This field is required")}
        type="text"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
      />
    ),
    textarea: (
      <TextAreaField
        id="overview-textarea"
        label="Your message"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please enter no more than 500 characters")}
        maxChars={500}
        placeholder="Type your message here..."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
    ),
  };

  return (
    <div className={styles.page}>
      <section className={styles.panel}>
        <h2 className="opus-panel-title">Settings</h2>

        <div className={styles.settingsGrid}>
          <SwitchField
            checked={flagged}
            id="settings-flagged"
            label="Flagged"
            labelPosition="left"
            mode="stacked"
            onChange={(event) => setFlagged(event.target.checked)}
          />
          <RadioGroup
            label="Label direction"
            name="settings-label-direction"
            value={labelDirection}
            onChange={(next) => setLabelDirection(next as LabelPosition)}
          >
            <Radio value="left">Left</Radio>
            <Radio value="right">Right</Radio>
          </RadioGroup>
          <RadioGroup
            label="Radio shape"
            name="settings-radio-shape"
            value={radioShape}
            onChange={(next) => setRadioShape(next as ChoiceShape)}
            shape={radioShape}
          >
            <Radio value="round">Round</Radio>
            <Radio value="square">Square</Radio>
          </RadioGroup>
          <RadioGroup
            label="Checkbox shape"
            name="settings-checkbox-shape"
            value={checkboxShape}
            onChange={(next) => setCheckboxShape(next as ChoiceShape)}
            shape={checkboxShape}
          >
            <Radio value="square">Square</Radio>
            <Radio value="round">Round</Radio>
          </RadioGroup>
          <SwitchField
            checked={errorsOn}
            id="settings-errors"
            label="Errors"
            labelPosition="left"
            mode="stacked"
            onChange={(event) => setErrorsOn(event.target.checked)}
          />
        </div>
      </section>

      <section className={styles.demoGrid}>
        {getControlsByCategory("forms").map((control) => {
          const demo = demos[control.slug];
          if (!demo) {
            return null;
          }

          return (
            <article key={control.slug} className={styles.demoCard}>
              <div className="opus-panel-heading">
                <span className="opus-panel-title">{control.title}</span>
                <Link className={styles.moreLink} href={componentPath(control.slug)}>
                  More
                </Link>
              </div>
              <div className={styles.demoCardBody}>{demo}</div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
