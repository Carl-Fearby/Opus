"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { useSetComponentsPageHeader } from "@/components/development/ComponentsThemeProvider";
import {
  Button,
  CascaderField,
  CheckboxField,
  ChipInput,
  ColorField,
  CountryPickerField,
  DateField,
  FileField,
  FilterSelectField,
  HiddenField,
  MultiSelectField,
  NumberField,
  PasswordStrengthField,
  PhoneNumberField,
  Radio,
  RadioGroup,
  RangeField,
  RatingField,
  RichTextField,
  SegmentedControlField,
  SelectField,
  SliderRangeField,
  SwitchField,
  TextAreaField,
  TextField,
  TransferListField,
  TreeSelectField,
  type ChoiceShape,
  type LabelPosition,
} from "@/components/fields";
import {
  cascaderDemoOptions,
  filterSelectDemoGroups,
  multiSelectDemoOptions,
  transferListDemoAvailable,
  treeSelectDemoNodes,
} from "@/lib/controls/advancedFormDemoData";
import { getControlsByCategory } from "@/lib/controls/registry";
import { componentPath } from "@/lib/controls/routes";
import type { ControlSlug } from "@/lib/controls/types";
import styles from "./overview.module.css";

const radioValues = [
  { label: "Personal", value: "personal" },
  { label: "Business", value: "business" },
  { label: "Enterprise", value: "enterprise" },
];

const now = new Date();

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toMonthValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function toWeekValue(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${pad(week)}`;
}

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
  const [website, setWebsite] = useState("https://example.com");
  const [search, setSearch] = useState("Search query");
  const [message, setMessage] = useState("");
  const [country, setCountry] = useState("Select a country");
  const [birthDate, setBirthDate] = useState(toDateValue(now));
  const [startTime, setStartTime] = useState(toTimeValue(now));
  const [appointment, setAppointment] = useState(`${toDateValue(now)}T${toTimeValue(now)}`);
  const [billingMonth, setBillingMonth] = useState(toMonthValue(now));
  const [planningWeek, setPlanningWeek] = useState(toWeekValue(now));
  const [accountType, setAccountType] = useState("personal");
  const [agree, setAgree] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState(60);
  const [quantity, setQuantity] = useState(3);
  const [fileName, setFileName] = useState("");
  const [accentColor, setAccentColor] = useState("#6D2BD9");
  const [chips, setChips] = useState(["Design", "React", "UI"]);
  const [richText, setRichText] = useState("<p>Describe your project goals and timeline.</p>");
  const [filterValues, setFilterValues] = useState(["Open", "High"]);
  const [multiSelectValues, setMultiSelectValues] = useState(["Design", "Engineering"]);
  const [transferSelected, setTransferSelected] = useState(["London", "Paris"]);
  const [passwordStrength, setPasswordStrength] = useState("Opus2026");
  const [rating, setRating] = useState(4);
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [budgetRange, setBudgetRange] = useState<[number, number]>([20, 80]);
  const [phoneNumber, setPhoneNumber] = useState("7700 900123");
  const [phoneCountryCode, setPhoneCountryCode] = useState("GB");
  const [countryPicker, setCountryPicker] = useState("GB");
  const [department, setDepartment] = useState("frontend");
  const [location, setLocation] = useState(["uk", "england", "london"]);

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
    "rich-text-field": (
      <RichTextField
        id="overview-rich-text-field"
        label="Description"
        minHeight={160}
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please enter a description")}
        placeholder="Write something…"
        value={richText}
        onChange={setRichText}
      />
    ),
    "chip-input": (
      <ChipInput
        id="overview-chip-input"
        label="Tags"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please add at least one tag")}
        placeholder="Add a tag…"
        value={chips}
        onChange={setChips}
      />
    ),
    "filter-select": (
      <FilterSelectField
        id="overview-filter-select"
        label="Filters"
        groups={filterSelectDemoGroups}
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select at least one filter")}
        value={filterValues}
        onChange={setFilterValues}
      />
    ),
    "multi-select": (
      <MultiSelectField
        id="overview-multi-select"
        label="Teams"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select at least one team")}
        options={multiSelectDemoOptions}
        value={multiSelectValues}
        onChange={setMultiSelectValues}
      />
    ),
    "transfer-list": (
      <TransferListField
        id="overview-transfer-list"
        label="Office locations"
        available={transferListDemoAvailable}
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select at least one location")}
        selected={transferSelected}
        onChange={setTransferSelected}
      />
    ),
    "password-strength-field": (
      <PasswordStrengthField
        id="overview-password-strength-field"
        label="Create password"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please choose a stronger password")}
        showRequirements
        value={passwordStrength}
        onChange={setPasswordStrength}
      />
    ),
    "rating-input": (
      <RatingField
        id="overview-rating-input"
        label="Satisfaction"
        max={5}
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please provide a rating")}
        value={rating}
        variant="stars"
        onChange={setRating}
      />
    ),
    "segmented-control": (
      <SegmentedControlField
        id="overview-segmented-control"
        label="Billing cycle"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a billing cycle")}
        options={["Monthly", "Quarterly", "Yearly"]}
        value={billingCycle}
        onChange={setBillingCycle}
      />
    ),
    "slider-range": (
      <SliderRangeField
        id="overview-slider-range"
        label="Budget range"
        max={100}
        min={0}
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a valid range")}
        step={1}
        value={budgetRange}
        onChange={setBudgetRange}
      />
    ),
    "phone-number-input": (
      <PhoneNumberField
        id="overview-phone-number-input"
        label="Mobile number"
        countryCode={phoneCountryCode}
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please enter a valid phone number")}
        value={phoneNumber}
        onChange={setPhoneNumber}
        onCountryCodeChange={setPhoneCountryCode}
      />
    ),
    "country-picker": (
      <CountryPickerField
        id="overview-country-picker"
        label="Country"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a country")}
        placeholder="Select country…"
        searchPlaceholder="Search countries…"
        value={countryPicker}
        onChange={setCountryPicker}
      />
    ),
    "tree-select": (
      <TreeSelectField
        id="overview-tree-select"
        label="Department"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a department")}
        nodes={treeSelectDemoNodes}
        value={department}
        onChange={setDepartment}
      />
    ),
    cascader: (
      <CascaderField
        id="overview-cascader"
        label="Location"
        mode={shared.mode}
        labelPosition={shared.labelPosition}
        error={shared.errorText("Please select a location")}
        options={cascaderDemoOptions}
        value={location}
        onChange={setLocation}
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
