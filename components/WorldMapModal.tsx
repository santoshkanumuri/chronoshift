
import React, { useState, useEffect, useRef } from 'react';
import { MapHotspot, SelectOption } from '../types';
import { WORLD_MAP_IMAGE_URL } from '../constants';

interface WorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySelections: (fromTimezone: string, toTimezone: string) => void;
  hotspots: MapHotspot[];
  allTimezoneOptions: SelectOption[]; // To validate if hotspot timezone exists
  accentColor: string;
}

const WorldMapModal: React.FC<WorldMapModalProps> = ({
  isOpen,
  onClose,
  onApplySelections,
  hotspots,
  allTimezoneOptions,
  accentColor,
}) => {
  const [selectedFrom, setSelectedFrom] = useState<MapHotspot | null>(null);
  const [selectedTo, setSelectedTo] = useState<MapHotspot | null>(null);
  const [currentSelectionStep, setCurrentSelectionStep] = useState<'from' | 'to'>('from'); // 'from' or 'to'
  const mapRef = useRef<HTMLDivElement>(null);

  // Reset selections when modal is opened/closed or step changes
  useEffect(() => {
    if (isOpen) {
      setSelectedFrom(null);
      setSelectedTo(null);
      setCurrentSelectionStep('from');
    }
  }, [isOpen]);

  const handleHotspotClick = (hotspot: MapHotspot) => {
    // Validate if the hotspot's timezone is available in the main list
    if (!allTimezoneOptions.find(opt => opt.value === hotspot.timezone)) {
        alert(`Timezone ${hotspot.timezone} for ${hotspot.name} is not currently available in the list. Please choose another location or update the main timezone list if possible.`);
        return;
    }

    if (currentSelectionStep === 'from') {
      setSelectedFrom(hotspot);
      setCurrentSelectionStep('to');
    } else {
      // Prevent selecting the same hotspot for 'to' if it's already 'from'
      if (selectedFrom && selectedFrom.id === hotspot.id) {
        alert("Please select a different location for the 'To' timezone.");
        return;
      }
      setSelectedTo(hotspot);
      // Optional: automatically move to apply or wait for user
    }
  };

  const handleApply = () => {
    if (selectedFrom && selectedTo) {
      onApplySelections(selectedFrom.timezone, selectedTo.timezone);
      onClose(); // Close modal after applying
    } else {
      alert("Please select both 'From' and 'To' locations on the map.");
    }
  };

  const handleResetSelections = () => {
    setSelectedFrom(null);
    setSelectedTo(null);
    setCurrentSelectionStep('from');
  };
  
  const accentTextClass = `text-${accentColor}-600 dark:text-${accentColor}-400`;
  const accentBgClass = `bg-${accentColor}-500 hover:bg-${accentColor}-600 focus:ring-${accentColor}-400`;
  const accentBorderClass = `border-${accentColor}-500`;


  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-gray-800 bg-opacity-75 dark:bg-black dark:bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
        onClick={onClose} // Close on overlay click
    >
      <div 
        className="bg-card-light dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside modal content
      >
        {/* Header */}
        <div className={`p-4 border-b border-input-border-light dark:border-input-border-dark flex justify-between items-center`}>
          <h2 className={`text-xl font-semibold ${accentTextClass} flex items-center`}>
            <i className="fas fa-map-marked-alt mr-2"></i>Select Timezones on Map
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Instructions & Selections Display */}
        <div className="p-3 text-sm bg-gray-50 dark:bg-slate-800 border-b border-input-border-light dark:border-input-border-dark">
            <p className="font-medium text-center mb-1">
                {currentSelectionStep === 'from' && "Click on the map to select your 'FROM' location."}
                {currentSelectionStep === 'to' && !selectedTo && "Now, select your 'TO' location."}
                {selectedFrom && selectedTo && "Selections complete. Click Apply or Reset."}
            </p>
            <div className="flex justify-around text-xs mt-1">
                <div><strong>From:</strong> {selectedFrom ? selectedFrom.name : <span className="italic">Not selected</span>}</div>
                <div><strong>To:</strong> {selectedTo ? selectedTo.name : <span className="italic">Not selected</span>}</div>
            </div>
        </div>

        {/* Map Area */}
        <div className="flex-grow p-2 sm:p-4 overflow-y-auto relative bg-gray-100 dark:bg-slate-700">
          <div
            ref={mapRef}
            className="relative w-full aspect-[2/1] bg-cover bg-center rounded shadow-inner" // aspect-video or aspect-[2/1] for map ratio
            style={{ backgroundImage: `url("${WORLD_MAP_IMAGE_URL}")` }}
            aria-label="World map for timezone selection"
          >
            {/* Placeholder if image fails or for better contrast for hotspots */}
             {!WORLD_MAP_IMAGE_URL.startsWith('https') && <div className="absolute inset-0 bg-blue-200 dark:bg-blue-800 opacity-50"></div>}
            
            {hotspots.map((spot) => {
              const isSelectedFrom = selectedFrom?.id === spot.id;
              const isSelectedTo = selectedTo?.id === spot.id;
              let ringColor = 'ring-transparent';
              if (isSelectedFrom) ringColor = 'ring-blue-500 dark:ring-blue-400';
              else if (isSelectedTo) ringColor = 'ring-green-500 dark:ring-green-400';

              return (
                <button
                  key={spot.id}
                  title={spot.name}
                  className={`absolute w-3 h-3 md:w-4 md:h-4 -translate-x-1/2 -translate-y-1/2 rounded-full 
                              bg-red-500 dark:bg-red-400 border-2 border-white dark:border-slate-900 
                              hover:scale-150 focus:outline-none focus:ring-2 ${ringColor} ring-offset-1 ring-offset-transparent
                              transition-all duration-150 ease-in-out shadow-md group`}
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  onClick={() => handleHotspotClick(spot)}
                  aria-label={`Select ${spot.name} as a timezone location`}
                >
                   <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 text-[0.6rem] bg-black bg-opacity-70 text-white rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 whitespace-nowrap transition-opacity">
                        {spot.name}
                    </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-input-border-light dark:border-input-border-dark flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleResetSelections}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 rounded-md shadow-sm transition-colors"
          >
            <i className="fas fa-undo mr-1.5"></i>Reset Selections
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedFrom || !selectedTo}
            className={`${accentBgClass} text-white px-6 py-2 text-sm font-medium rounded-md shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center`}
          >
            <i className="fas fa-check-circle mr-1.5"></i>Apply Selections
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorldMapModal;
