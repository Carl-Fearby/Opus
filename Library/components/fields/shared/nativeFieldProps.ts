import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | "aria-describedby"
  | "aria-invalid"
  | "className"
  | "defaultValue"
  | "id"
  | "onChange"
  | "placeholder"
  | "ref"
  | "required"
  | "size"
  | "type"
  | "value"
>;

export type NativeTextAreaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  | "aria-describedby"
  | "aria-invalid"
  | "className"
  | "defaultValue"
  | "id"
  | "maxLength"
  | "onChange"
  | "placeholder"
  | "required"
  | "value"
>;

export type TextEntryBehaviourProps = {
  autoCapitalize?: InputHTMLAttributes<HTMLInputElement>["autoCapitalize"];
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  autoCorrect?: InputHTMLAttributes<HTMLInputElement>["autoCorrect"];
  autoFocus?: boolean;
  disabled?: boolean;
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  name?: string;
  readOnly?: boolean;
  spellCheck?: boolean;
};
