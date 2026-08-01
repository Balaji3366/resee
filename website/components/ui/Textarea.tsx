import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, containerClassName = "", className = "", id, rows = 4, ...textareaProps },
  ref
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={textareaId} className="mb-1.5 block text-sm font-bold text-bone">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`w-full rounded-2xl border-2 bg-panel px-4 py-3 text-bone placeholder:text-slate transition-colors focus:outline-none ${
          error ? "border-red-500 focus:border-red-500" : "border-bone/15 focus:border-amber"
        } disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...textareaProps}
      />

      {error && (
        <p
          id={`${textareaId}-error`}
          role="alert"
          className="mt-1.5 text-sm font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${textareaId}-hint`} className="mt-1.5 text-sm text-slate">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Textarea;
