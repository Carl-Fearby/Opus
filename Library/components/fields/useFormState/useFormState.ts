"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";

export type FormFieldValue = string | number | boolean;

export type FormValues = Record<string, FormFieldValue>;

export type FormFieldState<TValue extends FormFieldValue = FormFieldValue> = {
  /** Current value. */
  value: TValue;
  /** Value the field was initialised or last reset to. */
  defaultValue: TValue;
  /** Value differs from `defaultValue`. */
  dirty: boolean;
  /** Field has been blurred or edited at least once. */
  touched: boolean;
  /** Validation message for the current value, when the form has a validator. */
  error?: string;
};

export type FormStateValidator<TValues extends FormValues> = (
  values: TValues,
) => Partial<Record<keyof TValues, string>>;

export type UseFormStateOptions<TValues extends FormValues> = {
  /** Initial values. Also the baseline used for dirty tracking and `reset()`. */
  defaults: TValues;
  validate?: FormStateValidator<TValues>;
};

export type UseFormStateResult<TValues extends FormValues> = {
  values: TValues;
  fields: { [K in keyof TValues]: FormFieldState<TValues[K]> };
  errors: Partial<Record<keyof TValues, string>>;
  dirtyFields: Array<keyof TValues>;
  touchedFields: Array<keyof TValues>;
  isDirty: boolean;
  isTouched: boolean;
  isValid: boolean;
  setValue: <K extends keyof TValues>(name: K, value: TValues[K]) => void;
  setTouched: (name: keyof TValues, touched?: boolean) => void;
  touchAll: () => void;
  reset: (nextDefaults?: TValues) => void;
  /** Props for text-like fields (`value` + change event). */
  register: <K extends keyof TValues>(
    name: K,
  ) => {
    name: string;
    value: TValues[K];
    onBlur: () => void;
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  };
  /** Props for checkbox / switch fields (`checked` + change event). */
  registerCheckbox: (
    name: keyof TValues,
  ) => {
    name: string;
    checked: boolean;
    onBlur: () => void;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  };
};

const FormStateContext = createContext<UseFormStateResult<FormValues> | null>(null);

export type FormStateProviderProps<TValues extends FormValues> =
  UseFormStateOptions<TValues> & {
    children: ReactNode;
  };

/**
 * Owns a form state instance and makes it available to any descendant field,
 * action bar, validation summary, or debug panel.
 */
export function FormStateProvider<TValues extends FormValues>({
  children,
  defaults,
  validate,
}: FormStateProviderProps<TValues>) {
  const form = useFormState({ defaults, validate });

  return createElement(
    FormStateContext.Provider,
    { value: form as unknown as UseFormStateResult<FormValues> },
    children,
  );
}

/** Read the nearest `FormStateProvider` with the caller's form value type. */
export function useFormStateContext<
  TValues extends FormValues = FormValues,
>(): UseFormStateResult<TValues> {
  const form = useContext(FormStateContext);
  if (!form) {
    throw new Error("useFormStateContext must be used within a FormStateProvider");
  }

  return form as unknown as UseFormStateResult<TValues>;
}

export function useFormState<TValues extends FormValues>({
  defaults,
  validate,
}: UseFormStateOptions<TValues>): UseFormStateResult<TValues> {
  const [baseline, setBaseline] = useState<TValues>(defaults);
  const [values, setValues] = useState<TValues>(defaults);
  const [touchedMap, setTouchedMap] = useState<Partial<Record<keyof TValues, boolean>>>({});

  const errors = useMemo<Partial<Record<keyof TValues, string>>>(
    () => validate?.(values) ?? {},
    [validate, values],
  );

  const setValue = useCallback(<K extends keyof TValues>(name: K, value: TValues[K]) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setTouchedMap((previous) => ({ ...previous, [name]: true }));
  }, []);

  const setTouched = useCallback((name: keyof TValues, touched = true) => {
    setTouchedMap((previous) => ({ ...previous, [name]: touched }));
  }, []);

  const touchAll = useCallback(() => {
    setTouchedMap((previous) => {
      const next = { ...previous };
      for (const key of Object.keys(values) as Array<keyof TValues>) {
        next[key] = true;
      }
      return next;
    });
  }, [values]);

  const reset = useCallback(
    (nextDefaults?: TValues) => {
      const target = nextDefaults ?? baseline;
      setBaseline(target);
      setValues(target);
      setTouchedMap({});
    },
    [baseline],
  );

  const register = useCallback(
    <K extends keyof TValues>(name: K) => ({
      name: String(name),
      value: values[name],
      onBlur: () => setTouched(name),
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setValue(name, event.target.value as TValues[K]),
    }),
    [setTouched, setValue, values],
  );

  const registerCheckbox = useCallback(
    (name: keyof TValues) => ({
      name: String(name),
      checked: Boolean(values[name]),
      onBlur: () => setTouched(name),
      onChange: (event: ChangeEvent<HTMLInputElement>) =>
        setValue(name, event.target.checked as TValues[keyof TValues]),
    }),
    [setTouched, setValue, values],
  );

  const fields = useMemo(() => {
    const entries = Object.keys(values).map((key) => {
      const name = key as keyof TValues;
      return [
        name,
        {
          value: values[name],
          defaultValue: baseline[name],
          dirty: values[name] !== baseline[name],
          touched: Boolean(touchedMap[name]),
          ...(errors[name] ? { error: errors[name] } : {}),
        },
      ] as const;
    });

    return Object.fromEntries(entries) as { [K in keyof TValues]: FormFieldState<TValues[K]> };
  }, [baseline, errors, touchedMap, values]);

  const dirtyFields = useMemo(
    () => (Object.keys(fields) as Array<keyof TValues>).filter((name) => fields[name].dirty),
    [fields],
  );

  const touchedFields = useMemo(
    () => (Object.keys(fields) as Array<keyof TValues>).filter((name) => fields[name].touched),
    [fields],
  );

  return {
    values,
    fields,
    errors,
    dirtyFields,
    touchedFields,
    isDirty: dirtyFields.length > 0,
    isTouched: touchedFields.length > 0,
    isValid: Object.keys(errors).length === 0,
    setValue,
    setTouched,
    touchAll,
    reset,
    register,
    registerCheckbox,
  };
}
