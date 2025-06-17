// src/components/FormInput.jsx
export default function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  required = true,
  id,
  autoComplete,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        id={id || name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
      />
    </div>
  );
}
