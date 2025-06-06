
import React from 'react';

interface DateTimeInputProps {
  dateValue: string;
  onDateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  timeValue: string;
  onTimeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSetCurrentTime: () => void;
  disabled?: boolean;
}

const DateTimeInput: React.FC<DateTimeInputProps> = ({
  dateValue,
  onDateChange,
  timeValue,
  onTimeChange,
  onSetCurrentTime,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div>
        <label htmlFor="conversion-date" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
          Date
        </label>
        <input
          type="date"
          id="conversion-date"
          value={dateValue}
          onChange={onDateChange}
          disabled={disabled}
          className="w-full p-3 border border-input-border-light dark:border-input-border-dark rounded-lg shadow-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark bg-input-bg-light dark:bg-input-bg-dark text-text-light dark:text-text-dark disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:light] dark:[color-scheme:dark] transition-colors"
        />
      </div>
      <div>
        <label htmlFor="time-input" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
          Time
        </label>
        <div className="flex items-center gap-2">
          <input
            type="time"
            id="time-input"
            value={timeValue}
            onChange={onTimeChange}
            disabled={disabled}
            className="w-full p-3 border border-input-border-light dark:border-input-border-dark rounded-lg shadow-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark bg-input-bg-light dark:bg-input-bg-dark text-text-light dark:text-text-dark disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:light] dark:[color-scheme:dark] transition-colors"
          />
          <button
            onClick={onSetCurrentTime}
            title="Set to current time & date"
            disabled={disabled}
            className="p-3 bg-primary-light dark:bg-primary-dark text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <i className="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeInput;