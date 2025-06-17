import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Or use any icons you prefer

export default function PasswordInput({
  label = "Password",
  value,
  onChange,
  name = "password",
  placeholder = "Enter your password",
  required = true,
  id,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-4 relative">
      <label
        htmlFor={id || name}
        className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        id={id || name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border rounded pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute top-8 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
