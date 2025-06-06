
import React from 'react';
import { SelectOption } from '../types'; // Assuming SelectOption is defined in types.ts

interface TimezoneSelectorProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  className?: string;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({
  id,
  label,
  value,
  options,
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled || options.length === 0}
        className="w-full p-3 border border-input-border-light dark:border-input-border-dark rounded-lg shadow-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark bg-input-bg-light dark:bg-input-bg-dark text-text-light dark:text-text-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {options.length === 0 && !disabled ? (
          <option value="">Loading timezones...</option>
        ) : options.length === 0 && disabled ? (
           <option value="">Unavailable</option>
        ) : (
          options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        )}
      </select>
    </div>
  );
};

export default TimezoneSelector;