
import React from 'react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  currentTheme: ThemeMode;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ currentTheme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      title="Toggle Night Mode"
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-text-light dark:text-text-dark transition-colors"
    >
      {currentTheme === ThemeMode.Dark ? (
        <i className="fas fa-sun text-xl text-yellow-400"></i>
      ) : (
        <i className="fas fa-moon text-xl text-indigo-400"></i>
      )}
    </button>
  );
};

export default ThemeToggle;