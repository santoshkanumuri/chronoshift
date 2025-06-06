
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TimezoneSelector from './components/TimezoneSelector';
import DateTimeInput from './components/DateTimeInput';
import ResultsTable from './components/ResultsTable';
import LoadingSpinner from './components/LoadingSpinner';
import ProfileManager from './components/ProfileManager';
import MeetingPlanner from './components/MeetingPlanner';
import ThemeToggle from './components/ThemeToggle';
import GeminiFunFact from './components/GeminiFunFact';
import WorldMapModal from './components/WorldMapModal'; // Import WorldMapModal

import * as worldTimeApiService from './services/worldTimeApiService';
import * as timezoneService from './services/timezoneService';
import * as geminiService from './services/geminiService';

import { 
  WorldTimeApiResponse, DisplayTimeData, Profile, ThemeMode, TimeOfDay, SelectOption, MeetingSlot, MapHotspot 
} from './types';
import { 
  DEFAULT_FROM_TIMEZONE, DEFAULT_TO_TIMEZONE, LOCAL_STORAGE_THEME_KEY, ACCENT_COLORS, MAP_HOTSPOTS
} from './constants';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  
  const [allTimezoneOptions, setAllTimezoneOptions] = useState<SelectOption[]>([]);
  const [fromTimezone, setFromTimezone] = useState<string>(DEFAULT_FROM_TIMEZONE);
  const [targetTimezones, setTargetTimezones] = useState<string[]>([DEFAULT_TO_TIMEZONE]);
  
  const initialDate = new Date();
  const [conversionDate, setConversionDate] = useState<string>(
    `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, '0')}-${String(initialDate.getDate()).padStart(2, '0')}`
  );
  const [conversionTime, setConversionTime] = useState<string>(
    `${String(initialDate.getHours()).padStart(2, '0')}:${String(initialDate.getMinutes()).padStart(2, '0')}`
  );

  const [results, setResults] = useState<DisplayTimeData[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(ThemeMode.Light);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(TimeOfDay.Morning);
  
  const [commonMeetingSlot, setCommonMeetingSlot] = useState<MeetingSlot | null>(null);
  const [individualMeetingSlots, setIndividualMeetingSlots] = useState<Array<{ timezone: string, localStart: string, localEnd: string }>>([]);
  const [meetingPlannerLoading, setMeetingPlannerLoading] = useState(false);
  const [allTimezonesValidForPlanner, setAllTimezonesValidForPlanner] = useState(true);

  const [funFact, setFunFact] = useState<string | null>(null);
  const [funFactLoading, setFunFactLoading] = useState(false);
  const [funFactTopic, setFunFactTopic] = useState<string | null>(null);

  // State for World Map Modal
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  
  const currentAccentColorName = ACCENT_COLORS[currentTheme === ThemeMode.Dark ? 'dark' : timeOfDay] || ACCENT_COLORS.default;


  // Theme Management
  useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as ThemeMode | null;
    if (storedTheme) {
      setCurrentTheme(storedTheme);
    }
    // Apply class to HTML element for Tailwind dark mode
    if (storedTheme === ThemeMode.Dark || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setCurrentTheme(ThemeMode.Dark);
    } else {
      document.documentElement.classList.remove('dark');
      setCurrentTheme(ThemeMode.Light);
    }
  }, []);

  const toggleTheme = () => {
    setCurrentTheme(prevTheme => {
      const newTheme = prevTheme === ThemeMode.Light ? ThemeMode.Dark : ThemeMode.Light;
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, newTheme);
      if (newTheme === ThemeMode.Dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  };

  // Update Time of Day based on first result's hour (simplified)
  useEffect(() => {
    if (results.length > 0 && results[0].hourInTargetZone !== null) {
      const hour = results[0].hourInTargetZone;
      if (hour >= 5 && hour < 12) setTimeOfDay(TimeOfDay.Morning);
      else if (hour >= 12 && hour < 17) setTimeOfDay(TimeOfDay.Afternoon);
      else if (hour >= 17 && hour < 21) setTimeOfDay(TimeOfDay.Evening);
      else setTimeOfDay(TimeOfDay.Night);
    } else {
      // Fallback to actual current time of user if no results
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 12) setTimeOfDay(TimeOfDay.Morning);
      else if (currentHour >= 12 && currentHour < 17) setTimeOfDay(TimeOfDay.Afternoon);
      else if (currentHour >= 17 && currentHour < 21) setTimeOfDay(TimeOfDay.Evening);
      else setTimeOfDay(TimeOfDay.Night);
    }
  }, [results]);


  // Fetch initial timezone list
  useEffect(() => {
    const loadTimezones = async () => {
      setIsLoading(true);
      setAppError(null);
      try {
        const tzList = await worldTimeApiService.fetchTimezoneList();
        const options = tzList.map(tz => ({ value: tz, label: timezoneService.formatTimezoneForDisplay(tz) }));
        setAllTimezoneOptions(options);

        // Attempt to set user's local timezone as default 'from'
        try {
          const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tzList.includes(browserTimezone)) {
            setFromTimezone(browserTimezone);
          }
        } catch (e) {
          console.warn("Could not get browser timezone, using default.", e);
        }
        
      } catch (error: any) {
        setAppError(error.message || "Failed to load timezone list. Please refresh.");
        console.error(error);
      } finally {
        setIsLoading(false);
        setIsInitialLoad(false); // Mark initial data load attempt as complete
      }
    };
    loadTimezones();
  }, []);

  const handleConvertTimes = useCallback(async () => {
    if (isInitialLoad || allTimezoneOptions.length === 0) return; // Don't run if timezones not loaded
    if (!fromTimezone || targetTimezones.every(tz => !tz)) {
      // Set results to empty and show a specific error if essential selections are missing
      // but don't prevent execution if called e.g. after fixing selections.
      if (!fromTimezone || targetTimezones.filter(tz => !!tz).length === 0) {
        setResults([]);
        setAppError("Please select 'From' and at least one valid 'To' timezone.");
        return;
      }
    }


    setIsLoading(true);
    setAppError(null);
    setResults([]); // Clear previous results
    setFunFact(null); setFunFactTopic(null); // Clear fun fact

    try {
      const sourceApiData = await worldTimeApiService.fetchTimezoneData(fromTimezone);
      if (!sourceApiData) {
        throw new Error(`Could not fetch data for source timezone: ${fromTimezone}`);
      }

      const referenceUtcTimestamp = timezoneService.getUtcTimestampFromInput(
        conversionDate,
        conversionTime,
        sourceApiData.utc_offset
      );

      if (isNaN(referenceUtcTimestamp)) {
        throw new Error("Invalid date/time for the source timezone.");
      }
      
      let displayDataList: DisplayTimeData[] = [];
      const displayedTimezones = new Set<string>();

      // Process source timezone
      const sourceDisplayData = timezoneService.processTimezoneApiData(sourceApiData, null, referenceUtcTimestamp, conversionDate, true);
      displayDataList.push(sourceDisplayData);
      displayedTimezones.add(sourceApiData.timezone);

      // Process target timezones
      const validTargetTimezones = targetTimezones.filter(tz => !!tz); // Filter out empty strings

      for (const targetId of validTargetTimezones) {
        if (displayedTimezones.has(targetId)) continue; // Skip already processed (e.g. if from=to)
        
        const targetApiData = await worldTimeApiService.fetchTimezoneData(targetId);
        if (targetApiData) {
          const targetDisplayData = timezoneService.processTimezoneApiData(targetApiData, sourceApiData, referenceUtcTimestamp, conversionDate, false);
          displayDataList.push(targetDisplayData);
          displayedTimezones.add(targetApiData.timezone);
        } else {
          // Add an error entry for this specific timezone
          displayDataList.push({
            id: targetId,
            locationName: `Error: ${timezoneService.formatTimezoneForDisplay(targetId)}`,
            abbreviation: 'N/A', timeString: 'Could not load', isDstActive: false, dstTooltip: '',
            eventHorizonText: 'N/A', timeWarpHtml: '', timezone: targetId, utcOffset: 'N/A', hourInTargetZone: null,
          });
        }
      }
      setResults(displayDataList);

      // Update meeting planner
      setMeetingPlannerLoading(true);
      const allSelectedTzForPlanner = [fromTimezone, ...validTargetTimezones.filter(tz => tz !== fromTimezone)];
      if (allSelectedTzForPlanner.length > 0) {
          const {commonSlot, individualSlots, allTimezonesValid} = await timezoneService.calculateMeetingSlots(
            allSelectedTzForPlanner,
            conversionDate,
            worldTimeApiService.fetchTimezoneData // Pass the fetch function
          );
          setCommonMeetingSlot(commonSlot);
          setIndividualMeetingSlots(individualSlots);
          setAllTimezonesValidForPlanner(allTimezonesValid);
      } else {
          setCommonMeetingSlot(null);
          setIndividualMeetingSlots([]);
          setAllTimezonesValidForPlanner(true);
      }
      setMeetingPlannerLoading(false);

    } catch (error: any) {
      setAppError(error.message || "An error occurred during conversion.");
      console.error(error);
      setResults([]); // Clear results on error
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromTimezone, targetTimezones, conversionDate, conversionTime, allTimezoneOptions.length, isInitialLoad]);


  // Auto-convert on input change (if not initial load)
  useEffect(() => {
    if (!isInitialLoad) {
      handleConvertTimes();
    }
  }, [handleConvertTimes, isInitialLoad]);


  const handleSetCurrentTime = () => {
    const now = new Date();
    setConversionDate(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
    setConversionTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    // handleConvertTimes will be triggered by useEffect dependency change
  };

  const handleAddTargetTimezone = () => {
    setTargetTimezones(prev => [...prev, '']); // Add an empty string for new selector
  };

  const handleTargetTimezoneChange = (index: number, value: string) => {
    setTargetTimezones(prev => prev.map((tz, i) => (i === index ? value : tz)));
  };

  const handleRemoveTargetTimezone = (index: number) => {
    setTargetTimezones(prev => prev.filter((_, i) => i !== index));
  };

  const handleSwapTimezones = () => {
    const validTargetTimezones = targetTimezones.filter(tz => !!tz);
    if (validTargetTimezones.length > 0 && validTargetTimezones[0]) {
      const firstTarget = validTargetTimezones[0];
      setFromTimezone(firstTarget);
      // Place the old 'fromTimezone' into the first 'toTimezone' slot, keeping other targets
      const newTargetTimezones = [...targetTimezones];
      const indexOfFirstTarget = targetTimezones.indexOf(firstTarget);
      if(indexOfFirstTarget !== -1) {
        newTargetTimezones[indexOfFirstTarget] = fromTimezone;
      } else { // Should not happen if firstTarget is from validTargetTimezones
         newTargetTimezones[0] = fromTimezone;
      }
      setTargetTimezones(newTargetTimezones);

    } else {
        alert("Cannot swap: No primary 'To' timezone selected or available.");
    }
  };

  const handleProfileLoad = (profile: Profile) => {
    setFromTimezone(profile.fromTimezone);
    setTargetTimezones([...profile.targetTimezones]); // Ensure new array for state update
    // Conversion will trigger due to state changes.
  };
  
  const handleFunFactClick = async (topic: string) => {
    setFunFactTopic(topic);
    setFunFactLoading(true);
    setFunFact(null);
    const factResult = await geminiService.getFunFactFromGemini(topic);
    setFunFact(factResult);
    setFunFactLoading(false);
  };

  const handleMapSelectionsApplied = (mapFromTz: string, mapToTz: string) => {
    setFromTimezone(mapFromTz);
    // Replace the first target timezone, or add if none exists. Keep other targets.
    setTargetTimezones(prevTargets => {
        const newTargets = [...prevTargets];
        if (newTargets.length > 0) {
            newTargets[0] = mapToTz;
        } else {
            newTargets.push(mapToTz);
        }
        // Ensure there are no empty strings if map provides valid selections
        return newTargets.filter(tz => !!tz); 
    });
    setIsMapModalOpen(false);
    // Conversion will be triggered by useEffect on fromTimezone/targetTimezones
  };

  const appIsBusy = isLoading || isInitialLoad;

  return (
    <div className={`min-h-screen flex flex-col items-center p-4 transition-colors duration-500 bg-gradient-to-br from-background-light to-background-light-to dark:from-background-dark dark:to-background-dark-to animate-gradient`}>
      {appIsBusy && <LoadingSpinner message={isInitialLoad ? "Initializing App..." : "Processing..."} />}
      <div className="container mx-auto w-full max-w-6xl">
        <div className="flex justify-between items-center mb-4">
            <div> {/* Placeholder for potential left-aligned items */} </div>
            <ThemeToggle currentTheme={currentTheme} onToggle={toggleTheme} />
        </div>
        <Header />
        
        <main className="bg-card-light dark:bg-card-dark p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Panel: Inputs */}
            <section className="lg:col-span-1 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className={`text-xl font-semibold text-${currentAccentColorName}-600 dark:text-${currentAccentColorName}-400 flex items-center`}>
                  <i className="fas fa-cogs mr-2"></i>Configure
                </h2>
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  disabled={appIsBusy || allTimezoneOptions.length === 0}
                  className={`py-2 px-3 text-sm bg-${currentAccentColorName}-500 hover:bg-${currentAccentColorName}-600 text-white rounded-lg shadow-md disabled:opacity-50 transition-colors flex items-center`}
                  title="Select timezones on a world map"
                >
                  <i className="fas fa-map-marked-alt mr-1.5"></i> Map
                </button>
              </div>
              
              <ProfileManager 
                onProfileLoad={handleProfileLoad}
                currentFromTimezone={fromTimezone}
                currentTargetTimezones={targetTimezones.filter(tz => !!tz)} // Pass only valid TZs
                disabled={appIsBusy || allTimezoneOptions.length === 0}
                accentColor={currentAccentColorName}
              />

              <TimezoneSelector
                id="from-timezone"
                label="From Timezone"
                value={fromTimezone}
                options={allTimezoneOptions}
                onChange={(e) => setFromTimezone(e.target.value)}
                disabled={appIsBusy || allTimezoneOptions.length === 0}
              />

              <div className="text-center my-0 py-0">
                <button 
                    onClick={handleSwapTimezones} 
                    disabled={appIsBusy || allTimezoneOptions.length === 0 || !targetTimezones.find(tz => !!tz) }
                    className="p-2 text-sm bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-transform hover:scale-110 active:scale-100"
                    title="Swap 'From' with first 'To' Timezone"
                >
                  <i className="fas fa-exchange-alt"></i>
                </button>
              </div>

              {targetTimezones.map((tz, index) => (
                <div key={index} className="relative">
                  <TimezoneSelector
                    id={`to-timezone-${index}`}
                    label={`To Timezone ${index + 1}`}
                    value={tz} // Can be empty string if newly added
                    options={allTimezoneOptions}
                    onChange={(e) => handleTargetTimezoneChange(index, e.target.value)}
                    disabled={appIsBusy || allTimezoneOptions.length === 0}
                  />
                  {targetTimezones.length > 1 && ( // Show remove button if more than one target selector
                    <button
                      onClick={() => handleRemoveTargetTimezone(index)}
                      disabled={appIsBusy}
                      className="absolute top-0 right-0 mt-1 mr-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full text-xs"
                      title="Remove this timezone"
                    >
                      <i className="fas fa-times-circle text-base"></i>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddTargetTimezone}
                disabled={appIsBusy || allTimezoneOptions.length === 0}
                className={`w-full py-2 px-4 border-2 border-dashed border-${currentAccentColorName}-500 text-${currentAccentColorName}-600 dark:border-${currentAccentColorName}-400 dark:text-${currentAccentColorName}-400 rounded-lg hover:bg-${currentAccentColorName}-50 dark:hover:bg-${currentAccentColorName}-900 dark:hover:bg-opacity-30 disabled:opacity-50 transition-colors`}
              >
                <i className="fas fa-plus mr-2"></i>Add Another 'To' Timezone
              </button>

              <DateTimeInput
                dateValue={conversionDate}
                onDateChange={(e) => setConversionDate(e.target.value)}
                timeValue={conversionTime}
                onTimeChange={(e) => setConversionTime(e.target.value)}
                onSetCurrentTime={handleSetCurrentTime}
                disabled={appIsBusy || allTimezoneOptions.length === 0}
              />
            </section>

            {/* Right Panel: Results */}
            <section className="lg:col-span-2 space-y-6">
              <h2 className={`text-xl font-semibold text-${currentAccentColorName}-600 dark:text-${currentAccentColorName}-400 flex items-center`}>
                <i className="fas fa-clock mr-2"></i>Converted Times
              </h2>
              <ResultsTable 
                results={results} 
                isLoading={isLoading && results.length === 0} // Show table loading only if no results yet
                error={appError}
                onFunFactClick={handleFunFactClick}
                accentColor={currentAccentColorName}
              />
              {funFactTopic && (
                <GeminiFunFact 
                    fact={funFact} 
                    isLoading={funFactLoading} 
                    topic={funFactTopic}
                    accentColor={currentAccentColorName}
                />
              )}
              {(results.length > 0 || commonMeetingSlot) && !appError && (
                <MeetingPlanner
                  commonSlot={commonMeetingSlot}
                  individualSlots={individualMeetingSlots}
                  isLoading={meetingPlannerLoading}
                  dateStr={conversionDate}
                  displayInTimezoneId={fromTimezone || (targetTimezones.filter(tz => !!tz).length > 0 ? targetTimezones.filter(tz => !!tz)[0] : null)}
                  allTimezonesValid={allTimezonesValidForPlanner}
                  accentColor={currentAccentColorName}
                />
              )}
            </section>
          </div>
        </main>
        <footer className="mt-10 text-center text-sm text-text-light dark:text-text-dark opacity-75">
          <p>ChronoShift &copy; {new Date().getFullYear()} | Made with <i className="fas fa-heart text-red-500"></i> and React.</p>
        </footer>
      </div>
      {isMapModalOpen && (
        <WorldMapModal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          onApplySelections={handleMapSelectionsApplied}
          hotspots={MAP_HOTSPOTS}
          allTimezoneOptions={allTimezoneOptions}
          accentColor={currentAccentColorName}
        />
      )}
    </div>
  );
};

export default App;
