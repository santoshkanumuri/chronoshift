
import React from 'react';
import { DisplayTimeData } from '../types';
import ResultRow from './ResultRow';

interface ResultsTableProps {
  results: DisplayTimeData[];
  isLoading: boolean;
  error: string | null;
  onFunFactClick: (topic: string) => void;
  accentColor: string;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, isLoading, error, onFunFactClick, accentColor }) => {
  const accentHeaderClass = `bg-${accentColor}-500`;

  if (!isLoading && error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900 dark:bg-opacity-30 border border-red-200 dark:border-red-700 rounded-lg">
        <i className="fas fa-exclamation-triangle mr-2"></i>{error}
      </div>
    );
  }

  if (!isLoading && results.length === 0 && !error) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
        <i className="fas fa-info-circle mr-2"></i>Select timezones and time to see results.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-xl bg-card-light dark:bg-card-dark">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className={`${accentHeaderClass} text-white`}>
          <tr>
            <th scope="col" className="px-3 md:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Location & DST
            </th>
            <th scope="col" className="px-3 md:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Time & Details
            </th>
            <th scope="col" className="px-3 md:px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Overlap & Diff
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
          {isLoading && results.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-light dark:text-primary-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Converting times...
                </div>
              </td>
            </tr>
          ) : (
            results.map(data => (
              <ResultRow key={data.id} data={data} onFunFactClick={onFunFactClick} accentColor={accentColor} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;