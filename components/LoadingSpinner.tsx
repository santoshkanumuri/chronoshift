
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = "Loading...", size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex flex-col items-center justify-center z-50 transition-opacity duration-300">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} border-t-transparent border-primary-light dark:border-primary-dark`}
      ></div>
      {message && <p className="mt-4 text-lg text-text-light dark:text-text-dark font-medium">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;