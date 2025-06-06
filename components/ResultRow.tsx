
import React from 'react';
import { DisplayTimeData } from '../types';
import { generateTimeWarpData } from '../services/timezoneService';

interface ResultRowProps {
  data: DisplayTimeData;
  onFunFactClick: (topic: string) => void;
  accentColor: string;
}

const ResultRow: React.FC<ResultRowProps> = ({ data, onFunFactClick, accentColor }) => {
  const timeWarpBubbles = generateTimeWarpData(new Date(Date.now()), data.timezone); // Using current Date for demo, ideally use converted date.

  const textAccentClass = `text-${accentColor}-600 dark:text-${accentColor}-400`;
  const borderAccentClass = `border-${accentColor}-500`;
  const bgAccentLightClass = `bg-${accentColor}-100 dark:bg-opacity-20`;
  
  return (
    <tr className="border-b border-input-border-light dark:border-input-border-dark last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
      {/* Location & DST */}
      <td className="p-3 md:p-4 align-top">
        <div className="flex items-start gap-3">
          <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full ${bgAccentLightClass} flex items-center justify-center ${textAccentClass} text-lg`}>
            <i className={`fas ${data.isSource ? 'fa-map-pin' : 'fa-map-marker-alt'}`}></i>
          </div>
          <div>
            <h3 className="font-semibold text-text-light dark:text-text-dark text-sm md:text-base">
              {data.locationName}
              {data.isDstActive && (
                <span 
                  className="ml-2 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100 px-1.5 py-0.5 rounded-full cursor-help"
                  title={data.dstTooltip}
                >
                  DST
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{data.timezone} ({data.abbreviation})</p>
             <button 
                onClick={() => onFunFactClick(data.locationName)}
                className={`mt-1 text-xs ${textAccentClass} hover:underline`}
                title={`Get a fun fact about ${data.locationName}`}
              >
                <i className="fas fa-lightbulb mr-1"></i>Fun Fact
              </button>
          </div>
        </div>
      </td>

      {/* Time & Event Horizon */}
      <td className="p-3 md:p-4 align-top">
        <p className={`font-bold text-lg md:text-xl ${textAccentClass}`}>
          {data.timeString}
          {data.dayDifference && <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">{data.dayDifference}</span>}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
          <i className="far fa-eye mr-1.5 opacity-70"></i>{data.eventHorizonText}
        </p>
        <div className={`mt-2 flex flex-wrap gap-1.5 border-t border-dashed pt-2 ${borderAccentClass} border-opacity-30`}>
          {timeWarpBubbles.map((bubble, idx) => (
            <span
              key={idx}
              title={bubble.title}
              className={`px-1.5 py-0.5 text-xs rounded-md ${
                bubble.isCurrent 
                  ? `${bgAccentLightClass} ${textAccentClass} font-semibold border ${borderAccentClass}` 
                  : `bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-gray-300 border border-transparent`
              }`}
            >
              {bubble.time}
            </span>
          ))}
        </div>
      </td>

      {/* Health & Difference */}
      <td className="p-3 md:p-4 align-top text-sm md:text-base">
        {data.isSource ? (
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Base Timezone</span>
        ) : (
          data.healthScore && data.differenceText && (
            <div className="flex flex-col items-start gap-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${data.healthScore.class}`}>
                    {data.healthScore.label}
                </span>
                <span className={`text-xs font-medium ${parseFloat(data.differenceText) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {data.differenceText}
                </span>
            </div>
          )
        )}
      </td>
    </tr>
  );
};

export default ResultRow;