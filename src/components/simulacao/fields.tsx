"use client";

import { useId } from "react";

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label className="label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  label,
  error,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint} htmlFor={id}>
      <input id={id} {...props} aria-invalid={!!error} className={`input ${error ? "input-error" : ""} ${props.className ?? ""}`} />
    </Field>
  );
}

export function SelectInput({
  label,
  error,
  options,
  placeholder = "Selecione",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: readonly { value: string; label: string }[];
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Field label={label} error={error} htmlFor={id}>
      <select id={id} {...props} aria-invalid={!!error} className={`input ${error ? "input-error" : ""}`}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function RadioGroup<T extends string>({
  label,
  name,
  value,
  onChange,
  options,
  error,
  hint,
  cols = 2,
}: {
  label: string;
  name: string;
  value: T | null;
  onChange: (v: T) => void;
  options: readonly { value: T; label: string }[];
  error?: string;
  hint?: string;
  cols?: 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className={`grid gap-2 ${cols === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2"}`}>
        {options.map((o) => (
          <label key={o.value} className="option">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="accent-caixa"
            />
            {o.label}
          </label>
        ))}
      </div>
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

const SIM_NAO = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
] as const;

export function YesNo({
  label,
  name,
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  name: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
  hint?: string;
  error?: string;
}) {
  return (
    <RadioGroup
      label={label}
      name={name}
      value={value == null ? null : value ? "sim" : "nao"}
      onChange={(v) => onChange(v === "sim")}
      options={SIM_NAO}
      hint={hint}
      error={error}
    />
  );
}
