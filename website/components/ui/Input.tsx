import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";

const inputStyles = cva(
  "w-full rounded-[12px] border-2 bg-panel px-4 text-bone placeholder:text-slate transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-9 text-sm",
        md: "h-11 text-base",
        lg: "h-[3.25rem] text-lg",
      },
      state: {
        default: "border-bone/15 focus:border-amber",
        error: "border-red-500 focus:border-red-500",
      },
    },
    defaultVariants: { size: "md", state: "default" },
  }
);

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  hint?: string;
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

/**
 * Text/email/password/number input with a label + error/hint slot and
 * optional icon slots. See docs/standards/design-system.md for the full
 * form-control inventory.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    error,
    hint,
    size = "md",
    leftIcon,
    rightIcon,
    containerClassName = "",
    className = "",
    id,
    ...inputProps
  },
  ref
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-bold text-bone">
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${inputStyles({ size, state: error ? "error" : "default" })} ${
            leftIcon ? "pl-10" : ""
          } ${rightIcon ? "pr-10" : ""} ${className}`}
          {...inputProps}
        />

        {rightIcon && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate">
            {rightIcon}
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${inputId}-hint`} className="mt-1.5 text-sm text-slate">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
