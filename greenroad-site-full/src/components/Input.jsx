import { forwardRef } from 'react';

/**
 * Input réutilisable avec label et erreur
 */
const Input = forwardRef(({
  label,
  icon: Icon,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          {Icon && <Icon className="inline mr-2" size={16} />}
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`
          w-full p-3 rounded-lg
          bg-zinc-800 border border-zinc-700
          text-white placeholder-zinc-500
          focus:border-green-500 focus:outline-none
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
