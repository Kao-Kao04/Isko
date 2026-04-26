interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  errorId?: string;
  className?: string;
}

export default function InputField({
  id,
  label,
  type = 'text',
  placeholder,
  required,
  autoComplete,
  errorId,
  className,
}: InputFieldProps) {
  return (
    <div className={`form-group${className ? ` ${className}` : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        aria-describedby={errorId}
      />
    </div>
  );
}
