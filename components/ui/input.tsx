import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Field({
  label,
  htmlFor,
  help,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  help?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`field ${className}`}>
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {help && <p className="field-help">{help}</p>}
    </div>
  );
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={className} {...props} />;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={className} {...props} />;
}

export function Select({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={className} {...props} />;
}

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={className} {...props} />;
}
