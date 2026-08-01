"use client";

import { FormProvider, Controller, useFormContext } from "react-hook-form";
import type { FieldValues, UseFormReturn, FieldPath } from "react-hook-form";
import type { ReactElement, ReactNode } from "react";

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

/**
 * Bridges react-hook-form + zod (via @hookform/resolvers/zod) to the
 * Sprint 2 form components. Mirrors the exact validation-error-shape
 * convention lib/validation/validateBody.ts already established
 * server-side, client-side. Usage:
 *
 *   const schema = z.object({ email: z.string().email() });
 *   const form = useForm({ resolver: zodResolver(schema) });
 *
 *   <Form form={form} onSubmit={(values) => ...}>
 *     <FormField name="email" render={(field, error) => (
 *       <Input label="Email" error={error} {...field} />
 *     )} />
 *   </Form>
 */
export function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className = "",
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className} noValidate>
        {children}
      </form>
    </FormProvider>
  );
}

interface FormFieldProps<T extends FieldValues> {
  name: FieldPath<T>;
  render: (
    field: { value: unknown; onChange: (value: unknown) => void; onBlur: () => void },
    error: string | undefined
  ) => ReactElement;
}

/**
 * Connects one react-hook-form Controller to any Sprint 2 form
 * component's existing `error`/value/onChange props — works uniformly
 * across native inputs (Input, Textarea) and Radix-based components
 * (Checkbox, RadioGroup, Switch, Select) rather than needing a
 * different integration pattern per component type.
 */
export function FormField<T extends FieldValues>({ name, render }: FormFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => render(field, fieldState.error?.message)}
    />
  );
}
