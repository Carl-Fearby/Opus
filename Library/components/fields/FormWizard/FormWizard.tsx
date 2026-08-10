"use client";

import { useId, useState, type ReactNode } from "react";
import { Button } from "../Button";
import styles from "./FormWizard.module.css";

export type FormWizardStep = {
  id: string;
  label: string;
  description?: string;
  content: ReactNode;
  disabled?: boolean;
  error?: string;
  optional?: boolean;
};

export type FormWizardProps = {
  steps: FormWizardStep[];
  ariaLabel?: string;
  activeStep?: number;
  defaultActiveStep?: number;
  allowStepNavigation?: boolean;
  backLabel?: string;
  cancelLabel?: string;
  completeLabel?: string;
  nextLabel?: string;
  orientation?: "horizontal" | "vertical";
  showCancel?: boolean;
  showDescriptions?: boolean;
  canAdvance?: (step: FormWizardStep, index: number) => boolean;
  onCancel?: () => void;
  onComplete?: (step: FormWizardStep, index: number) => void;
  onStepChange?: (step: FormWizardStep, index: number) => void;
  onValidationError?: (step: FormWizardStep, index: number) => void;
};

function clampStep(index: number, count: number) {
  return Math.min(Math.max(index, 0), Math.max(count - 1, 0));
}

export function FormWizard({
  steps,
  ariaLabel = "Form progress",
  activeStep,
  defaultActiveStep = 0,
  allowStepNavigation = true,
  backLabel = "Back",
  cancelLabel = "Cancel",
  completeLabel = "Complete",
  nextLabel = "Continue",
  orientation = "horizontal",
  showCancel = true,
  showDescriptions = true,
  canAdvance,
  onCancel,
  onComplete,
  onStepChange,
  onValidationError,
}: FormWizardProps) {
  const wizardId = useId();
  const [internalStep, setInternalStep] = useState(() => clampStep(defaultActiveStep, steps.length));
  const currentIndex = clampStep(activeStep ?? internalStep, steps.length);
  const currentStep = steps[currentIndex];

  if (!currentStep) {
    return null;
  }

  const selectStep = (index: number) => {
    const step = steps[index];
    if (!step || step.disabled || index === currentIndex) return;
    if (activeStep === undefined) setInternalStep(index);
    onStepChange?.(step, index);
  };

  const previous = () => selectStep(currentIndex - 1);

  const next = () => {
    if (canAdvance?.(currentStep, currentIndex) === false || currentStep.error) {
      onValidationError?.(currentStep, currentIndex);
      return;
    }

    if (currentIndex === steps.length - 1) {
      onComplete?.(currentStep, currentIndex);
      return;
    }

    selectStep(currentIndex + 1);
  };

  return (
    <section
      aria-label={ariaLabel}
      className={styles.wizard}
      data-component="form-wizard"
      data-orientation={orientation}
    >
      <nav aria-label="Form steps" className={styles.stepNavigation}>
        <ol className={styles.steps}>
          {steps.map((step, index) => {
            const completed = index < currentIndex;
            const current = index === currentIndex;
            const status = step.error ? "error" : current ? "current" : completed ? "completed" : "upcoming";
            const canSelect = allowStepNavigation && !step.disabled && !current;

            return (
              <li className={styles.step} data-status={status} key={step.id}>
                <button
                  aria-controls={current ? `${wizardId}-${step.id}-panel` : undefined}
                  aria-current={current ? "step" : undefined}
                  aria-disabled={!canSelect || undefined}
                  className={styles.stepButton}
                  disabled={step.disabled}
                  type="button"
                  onClick={() => {
                    if (canSelect) selectStep(index);
                  }}
                >
                  <span aria-hidden="true" className={styles.marker}>
                    {completed ? "✓" : index + 1}
                  </span>
                  <span className={styles.stepCopy}>
                    <span className={styles.stepLabel}>
                      {step.label}
                      {step.optional ? <span className={styles.optional}>Optional</span> : null}
                    </span>
                    {showDescriptions && step.description ? (
                      <span className={styles.stepDescription}>{step.description}</span>
                    ) : null}
                    {step.error ? <span className={styles.stepError}>{step.error}</span> : null}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div
        aria-labelledby={`${wizardId}-${currentStep.id}-title`}
        className={styles.panel}
        id={`${wizardId}-${currentStep.id}-panel`}
        role="region"
      >
        <header className={styles.panelHeader}>
          <p className={styles.progress}>Step {currentIndex + 1} of {steps.length}</p>
          <h2 id={`${wizardId}-${currentStep.id}-title`}>{currentStep.label}</h2>
          {currentStep.description ? <p>{currentStep.description}</p> : null}
        </header>
        <div className={styles.content}>{currentStep.content}</div>
      </div>

      <footer className={styles.actions}>
        <div>{showCancel ? <Button type="button" variant="secondary" onClick={onCancel}>{cancelLabel}</Button> : null}</div>
        <div className={styles.primaryActions}>
          <Button disabled={currentIndex === 0} type="button" variant="secondary" onClick={previous}>{backLabel}</Button>
          <Button type="button" onClick={next}>
            {currentIndex === steps.length - 1 ? completeLabel : nextLabel}
          </Button>
        </div>
      </footer>
    </section>
  );
}
