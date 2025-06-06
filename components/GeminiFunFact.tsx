
import React from 'react';

interface GeminiFunFactProps {
  fact: string | null;
  isLoading: boolean;
  topic: string | null;
  accentColor: string;
}

const GeminiFunFact: React.FC<GeminiFunFactProps> = ({ fact, isLoading, topic, accentColor }) => {
  if (!topic && !fact) { // Only show if a topic was selected or a fact is present
    return null;
  }
  
  const textAccentClass = `text-${accentColor}-700 dark:text-${accentColor}-300`;
  const bgAccentClass = `bg-${accentColor}-50 dark:bg-${accentColor}-900 dark:bg-opacity-30`;
  const borderAccentClass = `border-${accentColor}-200 dark:border-${accentColor}-700`;


  return (
    <div className={`mt-6 p-4 ${bgAccentClass} ${borderAccentClass} border rounded-lg shadow`}>
      <h4 className={`text-md font-semibold ${textAccentClass} mb-2`}>
        <i className="fas fa-lightbulb mr-2"></i>Fun Fact about {topic || "Selected Location"}
      </h4>
      {isLoading ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Fetching a fun fact...</p>
      ) : fact ? (
        <p className="text-sm text-text-light dark:text-text-dark">{fact}</p>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">No fun fact available or an error occurred.</p>
      )}
    </div>
  );
};

export default GeminiFunFact;