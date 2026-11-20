import { useId } from "react";
import "./Input.css";

export default function Input({
  label,
  name,
  type = "text",
  value,
  defaultValue,
  placeholder = "",
  hint,
  error,
  required = false,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  leftIcon,
  rightElement,
  className = "",
  onChange,
  onBlur,
  onFocus,
}) {
  const generatedId = useId();
  const inputId = `rf-input-${generatedId}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  const describedBy =
    [!error && hint ? hintId : null, error ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const fieldClassNames = [
    "rf-field",
    fullWidth ? "rf-field--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const wrapperClassNames = [
    "rf-input-wrapper",
    error ? "rf-input-wrapper--error" : "",
    disabled ? "rf-input-wrapper--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClassNames}>
      {label && (
        <label className="rf-field__label" htmlFor={inputId}>
          {label}
          {required && <span className="rf-field__required"> *</span>}
        </label>
      )}

      <div className={wrapperClassNames}>
        {leftIcon && (
          <span className="rf-input__icon rf-input__icon--left">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="rf-input"
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
        />

        {rightElement && (
          <span className="rf-input__right-element">{rightElement}</span>
        )}
      </div>

      {error && (
        <span id={errorId} className="rf-field__error" role="alert">
          {error}
        </span>
      )}

      {!error && hint && (
        <span id={hintId} className="rf-field__hint">
          {hint}
        </span>
      )}
    </div>
  );
}
