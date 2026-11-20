import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  onClick,
}) {
  const classNames = [
    "rf-button",
    `rf-button--${variant}`,
    `rf-button--${size}`,
    fullWidth ? "rf-button--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={onClick}
    >
      {loading ? (
        <span className="rf-button__spinner" aria-hidden="true" />
      ) : (
        leftIcon && (
          <span className="rf-button__icon" aria-hidden="true">
            {leftIcon}
          </span>
        )
      )}

      <span>{children}</span>

      {!loading && rightIcon && (
        <span className="rf-button__icon" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
}
