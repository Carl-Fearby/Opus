"use client";

import "@/lib/fontawesome";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@/components/Tooltip";
import styles from "./fieldControl.module.css";

type PasswordToggleProps = {
  visible: boolean;
  onToggle: () => void;
  controlsId?: string;
};

export function PasswordToggle({ visible, onToggle, controlsId }: PasswordToggleProps) {
  const label = visible ? "Hide password" : "Show password";

  return (
    <Tooltip className={styles.passwordToggleSlot} content={label} placement="top">
      <button
        aria-controls={controlsId}
        aria-label={label}
        aria-pressed={visible}
        className={styles.passwordToggle}
        onClick={onToggle}
        type="button"
      >
        <FontAwesomeIcon aria-hidden="true" icon={visible ? faEyeSlash : faEye} />
      </button>
    </Tooltip>
  );
}
