"use client";

import { useState } from "react";
import { BackgroundBlobs } from "@/components/BackgroundBlobs";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/fields/Button";
import { CheckboxField } from "@/components/fields/CheckboxField";
import { ChoiceChipsField } from "@/components/fields/ChoiceChipsField";
import { ColorField } from "@/components/fields/ColorField";
import { DateField } from "@/components/fields/DateField";
import { MultiSelectField } from "@/components/fields/MultiSelectField";
import { NumberField } from "@/components/fields/NumberField";
import { OtpField } from "@/components/fields/OtpField";
import { PasswordStrengthField } from "@/components/fields/PasswordStrengthField";
import { Radio, RadioGroup } from "@/components/fields/RadioGroup";
import { RatingField } from "@/components/fields/RatingField";
import { RangeField } from "@/components/fields/RangeField";
import { SegmentedControlField } from "@/components/fields/SegmentedControlField";
import { SelectField } from "@/components/fields/SelectField";
import { SliderRangeField } from "@/components/fields/SliderRangeField";
import { SwitchField } from "@/components/fields/SwitchField";
import { TextAreaField } from "@/components/fields/TextAreaField";
import { TextField } from "@/components/fields/TextField";
import { Container } from "@/components/Container";
import { Grid } from "@/components/Grid";
import { Heading } from "@/components/Heading";
import { Text } from "@/components/Text";
import { Panel } from "@/components/Panel";
import { Section } from "@/components/Section";
import type { BackgroundBlobsLabSettings, ControlRadius } from "@/lib/controls/types";
import styles from "./BackgroundBlobsThemeLab.module.css";

function LabWidget({
  title,
  children,
  radius,
}: {
  title: string;
  children: React.ReactNode;
  radius: ControlRadius;
}) {
  const radiusMap: Record<string, string> = {
    none: "0px",
    standard: "var(--opus-input-radius-large, 14px)",
    medium: "20px",
    large: "28px",
    full: "40px",
  };
  const borderRadius = radiusMap[radius] || "var(--opus-input-radius-large, 14px)";

  return (
    <Panel
      title={title}
      style={{
        background: "var(--opus-glass-surface, rgba(255, 255, 255, 0.1))",
        backdropFilter: "blur(20px) saturate(1.2)",
        border: "1px solid var(--opus-border-strong, rgba(255, 255, 255, 0.2))",
        borderRadius,
        boxShadow: "var(--opus-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        height: "auto",
      }}
    >
      <div style={{ display: "grid", gap: "20px", padding: "4px 0" }}>
        {children}
      </div>
    </Panel>
  );
}

export function BackgroundBlobsThemeLab({
  settings,
}: {
  settings: BackgroundBlobsLabSettings;
}) {
  const controlRadius = settings.controlRadius ?? "standard";
  const transparency = settings.transparency ?? "standard";
  const gradient = settings.gradient ?? false;
  const [query, setQuery] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [selected, setSelected] = useState("All components");
  const [date, setDate] = useState("2026-09-02");
  const [colour, setColour] = useState("#8f6cff");
  const [notes, setNotes] = useState("A translucent surface keeps the content legible.");
  const [quantity, setQuantity] = useState(3);
  const [range, setRange] = useState(62);
  const [priceRange, setPriceRange] = useState<[number, number]>([25, 75]);
  const [categories, setCategories] = useState<string[]>(["Design"]);
  const [chips, setChips] = useState<string | string[]>(["React"]);
  const [layout, setLayout] = useState("Comfortable");
  const [priority, setPriority] = useState("Normal");
  const [rating, setRating] = useState(4);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [surfaceLight, setSurfaceLight] = useState(true);
  const buttonVariants = ["primary", "secondary", "tertiary", "success", "warning", "danger", "info", "ghost", "link"] as const;
  const badgeTones = ["neutral", "info", "success", "warning", "danger"] as const;

  return (
    <div
      className={styles.lab}
      data-component-theme={surfaceLight ? "light" : "dark"}
      data-control-radius={controlRadius}
      data-control-transparency={transparency}
    >
      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>UI dark / component light</span>
      </div>
      <BackgroundBlobs placement="fixed">
        <Container
          className={styles.contentStack}
          padded={settings.containerPadded}
          size={settings.containerSize}
        >
          <div className={styles.contextBlock}>
            <Heading level={2} size={300}>Background Blobs control lab</Heading>
            <Text>
              This tests real controls over a moving colour field when the application chrome is
              dark but the component surface is light.
            </Text>
            <div className={styles.componentRow}>
              <Badge label={surfaceLight ? "Light component surface" : "Dark component surface"} tone="info" />
              <Badge label="Fixed viewport" tone="success" />
              <Badge label="Interactive" tone="neutral" />
            </div>
          </div>
          <div className={styles.controlSection}>
            <Heading level={3} size={200}>Container layouts</Heading>
            <Text style={{ marginBottom: "16px" }}>These nested examples show how the framework containers constrain and space widget content.</Text>
            <div className={styles.containerShowcase}>
              <Container className={styles.containerDemo} size="sm">
                <LabWidget title="Compact container" radius={controlRadius}>
                  <div className={styles.widgetContent}>
                    <Badge label="sm · 40rem" tone="info" />
                    <TextField
                      id="background-blobs-container-search"
                      label="Search"
                      radius={controlRadius}
                      transparency={transparency}
                      gradient={gradient}
                      onChange={(event) => setQuery(event.target.value)}
                      type="search"
                      value={query}
                    />
                  </div>
                </LabWidget>
              </Container>
              <Container className={styles.containerDemo} size="md">
                <LabWidget title="Reading container" radius={controlRadius}>
                  <div className={styles.widgetContent}>
                    <Badge label="md · 56rem" tone="success" />
                    <SelectField
                      id="background-blobs-container-filter"
                      label="Workflow"
                      radius={controlRadius}
                      transparency={transparency}
                      gradient={gradient}
                      onChange={(event) => setSelected(event.target.value)}
                      options={["All components", "Forms", "Actions", "Status"]}
                      value={selected}
                    />
                  </div>
                </LabWidget>
              </Container>
              <Container className={styles.containerDemo} size="full" padded={false}>
                <LabWidget title="Full-width container" radius={controlRadius}>
                  <div className={styles.widgetContent}>
                    <Badge label="full · 100%" tone="warning" />
                    <Button radius={controlRadius} variant="primary">Open full-width workflow</Button>
                  </div>
                </LabWidget>
              </Container>
            </div>
          </div>
          <Section title="Framework components" description="Testing nested sections, widgets, and form controls over moving blobs.">
            <div style={{ display: "grid", gap: "24px" }}>
              <Container size="full">
                <LabWidget title="Primary form workflow" radius={controlRadius}>
                  <Grid columns={2} gap={24}>
                    <TextField
                      id="background-blobs-lab-query"
                      label="Search content"
                      radius={controlRadius}
                      transparency={transparency}
                      gradient={gradient}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Try typing here"
                      type="search"
                      value={query}
                    />
                    <SelectField
                      id="background-blobs-lab-filter"
                      label="Filter"
                      radius={controlRadius}
                      transparency={transparency}
                      gradient={gradient}
                      onChange={(event) => setSelected(event.target.value)}
                      options={["All components", "Forms", "Actions", "Status"]}
                      value={selected}
                    />
                    <CheckboxField
                      checked={enabled}
                      id="background-blobs-lab-enabled"
                      label="Enable live samples"
                      radius={controlRadius}
                      transparency={transparency}
                      gradient={gradient}
                      onChange={(event) => setEnabled(event.target.checked)}
                    />
                    <SwitchField
                      checked={surfaceLight}
                      id="background-blobs-lab-surface"
                      label="Light component surface"
                      radius={controlRadius}
                      transparency={transparency}
                      gradient={gradient}
                      onChange={(event) => setSurfaceLight(event.target.checked)}
                    />
                  </Grid>
                </LabWidget>
              </Container>

              <Container size="full">
                <LabWidget title="Metadata and layout" radius={controlRadius}>
                  <Grid columns={2} gap={24}>
                    <TextAreaField id="background-blobs-lab-notes" label="Notes" maxChars={120} radius={controlRadius} value={notes} transparency={transparency} gradient={gradient} onChange={(event) => setNotes(event.target.value)} />
                    <MultiSelectField id="background-blobs-lab-categories" label="Categories" options={["Design", "Engineering", "Research", "Marketing"]} radius={controlRadius} transparency={transparency} gradient={gradient} value={categories} onChange={setCategories} />
                    <ChoiceChipsField id="background-blobs-lab-chips" label="Tags" options={[{ label: "React", value: "React" }, { label: "CSS", value: "CSS" }, { label: "A11y", value: "A11y" }]} radius={controlRadius} transparency={transparency} gradient={gradient} selectionMode="multiple" value={chips} onChange={setChips} />
                    <SegmentedControlField id="background-blobs-lab-layout" label="Density" options={["Compact", "Comfortable", "Spacious"]} radius={controlRadius} transparency={transparency} gradient={gradient} value={layout} onChange={setLayout} />
                  </Grid>
                </LabWidget>
              </Container>

              <Container size="full">
                <LabWidget title="Operational priority" radius={controlRadius}>
                  <RadioGroup id="background-blobs-lab-priority" label="Priority" name="background-blobs-priority" radius={controlRadius} transparency={transparency} gradient={gradient} value={priority} onChange={setPriority} orientation="horizontal">
                    <Radio value="Low">Low</Radio>
                    <Radio value="Normal">Normal</Radio>
                    <Radio value="High">High</Radio>
                  </RadioGroup>
                </LabWidget>
              </Container>
            </div>
          </Section>

          <Section title="Data entry and metrics" description="Testing numeric and range inputs in a widget context.">
            <Container size="full">
              <LabWidget title="Value controls and interactive ranges" radius={controlRadius}>
                <Grid columns={2} gap={24}>
                  <NumberField id="background-blobs-lab-quantity" label="Quantity" min={0} max={20} radius={controlRadius} transparency={transparency} gradient={gradient} value={quantity} onChange={(event) => setQuantity(event.target.valueAsNumber)} />
                  <RangeField id="background-blobs-lab-range" label="Opacity" min={0} max={100} radius={controlRadius} transparency={transparency} gradient={gradient} value={range} onChange={(event) => setRange(Number(event.target.value))} />
                  <SliderRangeField id="background-blobs-lab-price" label="Price range" min={0} max={100} radius={controlRadius} transparency={transparency} gradient={gradient} value={priceRange} onChange={setPriceRange} />
                  <RatingField id="background-blobs-lab-rating" label="Rating" radius={controlRadius} transparency={transparency} gradient={gradient} value={rating} onChange={setRating} variant="hearts" />
                </Grid>
              </LabWidget>
            </Container>
          </Section>

          <Section title="User verification" description="Testing secure entry components.">
            <Container size="full">
              <LabWidget title="Identity and MFA Verification" radius={controlRadius}>
                <Grid columns={2} gap={24}>
                  <PasswordStrengthField id="background-blobs-lab-password" label="Password" radius={controlRadius} transparency={transparency} gradient={gradient} value={password} onChange={setPassword} />
                  <OtpField id="background-blobs-lab-otp" label="Verification code" radius={controlRadius} transparency={transparency} gradient={gradient} value={otp} onChange={setOtp} onComplete={() => setEnabled(true)} />
                </Grid>
              </LabWidget>
            </Container>
          </Section>

          <Section title="Actions and pickers" description="Testing miscellaneous controls.">
            <Container size="full">
              <LabWidget title="Operational components" radius={controlRadius}>
                <Grid columns={2} gap={24}>
                  <div style={{ display: "grid", gap: "16px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                      {buttonVariants.map((variant) => (
                        <Button key={variant} radius={controlRadius} variant={variant}>{variant}</Button>
                      ))}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                      {badgeTones.map((tone) => (
                        <Badge key={tone} label={`${tone} status`} tone={tone} />
                      ))}
                      <Badge label={query ? "Input active" : enabled ? "Ready" : "Paused"} tone={query ? "success" : "neutral"} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: "16px" }}>
                    <DateField
                      id="background-blobs-lab-date"
                      label="Date picker"
                      radius={controlRadius}
                      transparency={transparency}
                      gradient={gradient}
                      onChange={(event) => setDate(event.target.value)}
                      type="date"
                      value={date}
                    />
                    <ColorField
                      id="background-blobs-lab-colour"
                      label="Colour picker"
                      radius={controlRadius}
                      transparency={transparency}
                      gradient={gradient}
                      onChange={(event) => setColour(event.target.value)}
                      value={colour}
                    />
                  </div>
                </Grid>
              </LabWidget>
            </Container>
          </Section>
        </Container>
      </BackgroundBlobs>
    </div>
  );
}
