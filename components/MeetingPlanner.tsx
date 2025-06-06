
import React from 'react';
import { MeetingSlot } from '../types';
import { formatTimezoneForDisplay } from '../services/timezoneService';

interface MeetingPlannerProps {
  commonSlot: MeetingSlot | null;
  individualSlots: Array<{ timezone: string, localStart: string, localEnd: string }>;
  isLoading: boolean;
  dateStr: string; // YYYY-MM-DD
  displayInTimezoneId: string | null; // Timezone to display the main slot in
  allTimezonesValid: boolean; // Were all timezones processed successfully for slots?
  accentColor: string;
}

const MeetingPlanner: React.FC<MeetingPlannerProps> = ({ 
    commonSlot, 
    individualSlots, 
    isLoading, 
    dateStr, 
    displayInTimezoneId,
    allTimezonesValid,
    accentColor
 }) => {
  if (isLoading) {
    return (
      <div className="mt-6 p-4 bg-card-light dark:bg-card-dark shadow-md rounded-lg">
        <h3 className={`text-lg font-semibold text-${accentColor}-600 dark:text-${accentColor}-400 mb-2`}>
          <i className="fas fa-users mr-2"></i>Common Availability (9am-5pm, Mon-Fri)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Calculating...</p>
      </div>
    );
  }

  if (!commonSlot && !allTimezonesValid && individualSlots.length === 0) {
     return (
      <div className="mt-6 p-4 bg-card-light dark:bg-card-dark shadow-md rounded-lg">
        <h3 className={`text-lg font-semibold text-${accentColor}-600 dark:text-${accentColor}-400 mb-2`}>
          <i className="fas fa-users mr-2"></i>Common Availability
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Could not determine working hours for any selected timezone on {new Date(dateStr + "T12:00:00Z").toLocaleDateString(undefined, { timeZone: 'UTC', month: 'short', day: 'numeric' })} (or all are weekends/data unavailable).
        </p>
      </div>
    );
  }


  const formattedDate = new Date(dateStr + "T12:00:00Z").toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });

  return (
    <div className="mt-6 p-4 bg-card-light dark:bg-card-dark shadow-md rounded-lg">
      <h3 className={`text-lg font-semibold text-${accentColor}-600 dark:text-${accentColor}-400 mb-2`}>
        <i className="fas fa-users mr-2"></i>Common Availability on {formattedDate}
      </h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-text-light dark:text-text-dark">
        {commonSlot && displayInTimezoneId ? (
          <>
            <li>
              <strong>
                {new Date(commonSlot.start).toLocaleTimeString('en-US', { timeZone: displayInTimezoneId, hour: 'numeric', minute: '2-digit', hour12: true })}
                {' - '}
                {new Date(commonSlot.end).toLocaleTimeString('en-US', { timeZone: displayInTimezoneId, hour: 'numeric', minute: '2-digit', hour12: true })}
              </strong>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                (in {formatTimezoneForDisplay(displayInTimezoneId)})
              </span>
            </li>
            {individualSlots.filter(slot => slot.timezone !== displayInTimezoneId).map(slot => (
                 <li key={slot.timezone} className="text-xs opacity-80">
                    {slot.localStart} - {slot.localEnd}
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                        (in {formatTimezoneForDisplay(slot.timezone)})
                    </span>
                 </li>
            ))}
             {!allTimezonesValid && (
                <li className="text-xs text-yellow-600 dark:text-yellow-400 italic mt-1">
                    Note: Some timezones could not be processed for working hours. Overlap is based on available data.
                </li>
            )}
          </>
        ) : (
          <li className="italic text-gray-500 dark:text-gray-400">
            {allTimezonesValid ? 'No common 9am-5pm (Mon-Fri) slots found.' : 'Could not determine common availability due to missing data for some timezones or all are weekends.'}
          </li>
        )}
      </ul>
    </div>
  );
};

export default MeetingPlanner;