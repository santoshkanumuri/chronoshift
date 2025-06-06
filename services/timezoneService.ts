
import { WorldTimeApiResponse, DisplayTimeData, TimezoneHealth, MeetingSlot, TimezoneWorkingHours } from '../types';
import { WORKING_HOURS_START, WORKING_HOURS_END } from '../constants';

export const formatTimezoneForDisplay = (timezoneIdentifier: string): string => {
  if (!timezoneIdentifier) return "N/A";
  return timezoneIdentifier.replace(/_/g, ' ').replace(/\//g, ' / ');
};

export const formatDstDate = (isoString: string | null): string => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  } catch (e) {
    console.error("Error formatting DST date:", isoString, e);
    return 'N/A';
  }
};

export const getUtcTimestampFromInput = (dateStr: string, timeStr: string, sourceUtcOffsetStr: string): number => {
  if (!dateStr || !timeStr || !sourceUtcOffsetStr) {
    console.error("getUtcTimestampFromInput: Missing required parameters."); return NaN;
  }
  // Ensure seconds are included for robust parsing, even if 00
  const timeWithSeconds = timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
  const isoStringWithOffset = `${dateStr}T${timeWithSeconds}${sourceUtcOffsetStr}`;
  
  const timestamp = new Date(isoStringWithOffset).getTime();
  if (isNaN(timestamp)) {
    console.error("Failed to parse date/time with offset:", isoStringWithOffset);
  }
  return timestamp;
};


export const parseOffsetToTotalMinutes = (offsetString: string): number => {
  if (!offsetString || typeof offsetString !== 'string') return 0;
  const sign = offsetString[0] === '-' ? -1 : 1;
  const parts = offsetString.substring(1).split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10) || 0;
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return sign * (hours * 60 + minutes);
};

export const calculateTimezoneHealth = (offset1Str: string, offset2Str: string): TimezoneHealth => {
  const diffMinutes = Math.abs(parseOffsetToTotalMinutes(offset1Str) - parseOffsetToTotalMinutes(offset2Str));
  const diffHours = diffMinutes / 60;
  if (diffHours <= 3) return { score: 100, class: 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100', label: 'Excellent Overlap' };
  if (diffHours <= 6) return { score: 60, class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100', label: 'Fair Overlap' };
  return { score: 30, class: 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100', label: 'Poor Overlap' };
};

export const getEventHorizonInfo = (convertedDateInTargetZone: Date, targetTimezone: string): string => {
  const dayOfWeek = convertedDateInTargetZone.getDay(); // 0 (Sun) - 6 (Sat)
  const hour = convertedDateInTargetZone.getHours();
  const locationShortName = targetTimezone.split('/').pop()?.replace(/_/g, ' ') || 'target location';

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return `Likely seen next working day (weekend in ${locationShortName})`;
  }
  if (hour >= WORKING_HOURS_START && hour < WORKING_HOURS_END) {
    return `Likely seen during working hours`;
  } else if (hour < WORKING_HOURS_START) {
    return `Likely seen at the start of their working day`;
  } else { // After WORKING_HOURS_END
    return `Likely seen next working day`;
  }
};

export const generateTimeWarpData = (baseDate: Date, timezone: string): Array<{time: string, isCurrent: boolean, title: string}> => {
  const intervals = [-3, 0, 3]; // Hours relative to current time
  return intervals.map(offset => {
    const warpedDate = new Date(baseDate.getTime() + offset * 60 * 60 * 1000);
    const timeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(warpedDate);
    return {
        time: timeStr,
        isCurrent: offset === 0,
        title: offset === 0 ? 'Converted Time' : (offset < 0 ? `${offset}h` : `+${offset}h`)
    };
  });
};

export const processTimezoneApiData = (
  apiData: WorldTimeApiResponse,
  sourceApiDataForDiff: WorldTimeApiResponse | null,
  referenceUtcTimestamp: number,
  originalInputDateStr: string, // YYYY-MM-DD
  isSourceRow: boolean
): DisplayTimeData => {
  const locationName = formatTimezoneForDisplay(apiData.timezone);
  const abbreviation = apiData.abbreviation || 'N/A';
  const masterDisplayDate = new Date(referenceUtcTimestamp);

  let timeString: string;
  let hourInTargetZone: number | null = null;
  let dstTooltip = '';
  let isDstActiveOnDate = false;
  let eventHorizonText = '';
  let dayDifferenceText = '';

  try {
    // DST check based on current API data (which is for the *current* date, not necessarily the selected one)
    // For DST on a *specific selected date*, WorldTimeAPI doesn't directly give past/future DST for a specific date in one call.
    // The `apiData.dst` boolean is whether DST is active *now* in that timezone.
    // We use the `referenceUtcTimestamp` to format the time.
    // A more accurate DST check for a *selected date* would require more complex logic or a different API.
    // For simplicity, we'll use the API's current DST status and period as indicative.
    isDstActiveOnDate = apiData.dst; // This reflects DST status at the time of API call for that TZ.
    if (apiData.dst_from && apiData.dst_until) {
        dstTooltip = `Current API DST Period: ${formatDstDate(apiData.dst_from)} - ${formatDstDate(apiData.dst_until)}. Offset: ${apiData.dst_offset / 3600}h.`;
         // A rough check if the selected date falls within the *current* DST period from API. This is an approximation.
        const selectedDate = new Date(originalInputDateStr + "T12:00:00Z");
        const dstStart = new Date(apiData.dst_from);
        const dstEnd = new Date(apiData.dst_until);
        if(selectedDate >= dstStart && selectedDate < dstEnd) {
             isDstActiveOnDate = true; // More specific if selected date is within current DST period
        } else {
             isDstActiveOnDate = false; // If selected date is outside current DST period
        }

    } else if (apiData.dst) {
        dstTooltip = `DST Currently Active. Offset: ${apiData.dst_offset / 3600}h.`;
    } else {
        dstTooltip = 'DST Not Currently Active.';
    }


    timeString = new Intl.DateTimeFormat('en-US', { timeZone: apiData.timezone, hour: '2-digit', minute: '2-digit', hour12: true }).format(masterDisplayDate);
    const localDateInTarget = new Date(masterDisplayDate.toLocaleString("en-US", {timeZone: apiData.timezone}));
    
    // Compare date part of localDateInTarget with originalInputDateStr
    const originalInputDateObj = new Date(originalInputDateStr + "T00:00:00Z"); // Ensure UTC context for original date
    
    const localTargetDateOnly = new Date(localDateInTarget.getFullYear(), localDateInTarget.getMonth(), localDateInTarget.getDate());
    const originalInputDateOnly = new Date(originalInputDateObj.getUTCFullYear(), originalInputDateObj.getUTCMonth(), originalInputDateObj.getUTCDate());

    const dayDiff = Math.round((localTargetDateOnly.getTime() - originalInputDateOnly.getTime()) / (24*60*60*1000));

    if (dayDiff === 1) dayDifferenceText = "(Next Day)";
    else if (dayDiff === -1) dayDifferenceText = "(Prev. Day)";
    else if (dayDiff !== 0) {
      dayDifferenceText = `(${localDateInTarget.toLocaleDateString(undefined, {month:'short', day:'numeric', timeZone: 'UTC'})})`;
    }

    hourInTargetZone = parseInt(new Intl.DateTimeFormat('en-GB', { timeZone: apiData.timezone, hour: '2-digit', hourCycle: 'h23' }).format(masterDisplayDate), 10);
    eventHorizonText = getEventHorizonInfo(localDateInTarget, apiData.timezone);

  } catch (e: any) {
    console.error("Error formatting time for", apiData.timezone, e);
    timeString = "Error";
    dstTooltip = "DST info error.";
    eventHorizonText = "N/A";
  }

  let health: TimezoneHealth | undefined;
  let diffText: string | undefined;

  if (!isSourceRow && sourceApiDataForDiff) {
    health = calculateTimezoneHealth(sourceApiDataForDiff.utc_offset, apiData.utc_offset);
    const sourceOffsetMins = parseOffsetToTotalMinutes(sourceApiDataForDiff.utc_offset);
    const targetOffsetMins = parseOffsetToTotalMinutes(apiData.utc_offset);
    const diffMinutesTotal = targetOffsetMins - sourceOffsetMins;
    const diffAbsHours = Math.floor(Math.abs(diffMinutesTotal) / 60);
    const diffAbsMinutesPart = Math.abs(diffMinutesTotal) % 60;
    diffText = `${diffMinutesTotal >= 0 ? '+' : '-'}${diffAbsHours}h`;
    if (diffAbsMinutesPart > 0) diffText += ` ${diffAbsMinutesPart}m`;
  }

  return {
    id: apiData.timezone,
    locationName: locationName.split(' / ').pop() || locationName,
    abbreviation,
    timeString,
    dayDifference: dayDifferenceText,
    isDstActive: isDstActiveOnDate,
    dstTooltip,
    eventHorizonText,
    timeWarpHtml: '', // Placeholder, will be generated by component
    healthScore: health,
    differenceText: diffText,
    isSource: isSourceRow,
    utcOffset: apiData.utc_offset,
    timezone: apiData.timezone, // Full identifier
    hourInTargetZone: hourInTargetZone,
  };
};


export const calculateMeetingSlots = async (
  timezoneIds: string[],
  dateStr: string, // YYYY-MM-DD
  fetchFn: (tzId: string) => Promise<WorldTimeApiResponse | null>
): Promise<{
  commonSlot: MeetingSlot | null,
  individualSlots: Array<{ timezone: string, localStart: string, localEnd: string }>,
  allTimezonesValid: boolean
}> => {
  let allIntervalsUTC: TimezoneWorkingHours[] = [];
  let allTimezonesProcessedSuccessfully = true;

  for (const tzId of timezoneIds) {
    const apiData = await fetchFn(tzId);
    if (!apiData || !apiData.utc_offset) {
      console.warn(`Skipping ${tzId} for meeting planner: no API data or offset.`);
      allTimezonesProcessedSuccessfully = false;
      continue;
    }

    // Check for weekend in the target timezone
    // Create a date object representing noon UTC on the selected date string
    const noonUtcOnSelectedDate = new Date(dateStr + "T12:00:00Z");
    // Format this UTC date into the target timezone's local date string, then parse to get local day
    const localDateStringInTargetTz = noonUtcOnSelectedDate.toLocaleString("en-US", {timeZone: tzId});
    const dateInTargetTz = new Date(localDateStringInTargetTz);
    const dayOfWeekInTargetTz = dateInTargetTz.getDay(); // 0 (Sun) - 6 (Sat)

    if (dayOfWeekInTargetTz === 0 || dayOfWeekInTargetTz === 6) {
      console.log(`${tzId} is a weekend on ${dateStr}. Skipping for meeting planner.`);
      continue; // Skip weekends
    }

    const startUTC = getUtcTimestampFromInput(dateStr, `${String(WORKING_HOURS_START).padStart(2, '0')}:00`, apiData.utc_offset);
    const endUTC = getUtcTimestampFromInput(dateStr, `${String(WORKING_HOURS_END).padStart(2, '0')}:00`, apiData.utc_offset);

    if (!isNaN(startUTC) && !isNaN(endUTC) && endUTC > startUTC) {
      allIntervalsUTC.push({ timezone: tzId, startUTC: startUTC, endUTC: endUTC });
    } else {
      console.warn(`Could not form valid UTC interval for ${tzId} on ${dateStr}. Start: ${startUTC}, End: ${endUTC}`);
      allTimezonesProcessedSuccessfully = false;
    }
  }

  if (allIntervalsUTC.length === 0) {
    return { commonSlot: null, individualSlots: [], allTimezonesValid: allTimezonesProcessedSuccessfully };
  }

  const intersection = allIntervalsUTC.reduce((acc, interval) => {
    if (!acc) return { start: interval.startUTC, end: interval.endUTC };
    return { start: Math.max(acc.start, interval.startUTC), end: Math.min(acc.end, interval.endUTC) };
  }, null as MeetingSlot | null);

  let commonSlotResult: MeetingSlot | null = null;
  if (intersection && intersection.end > intersection.start) {
    commonSlotResult = intersection;
  }
  
  const individualSlotsFormatted = commonSlotResult ? allIntervalsUTC.map(interval => {
      const formatter = new Intl.DateTimeFormat('en-US', { timeZone: interval.timezone, hour: 'numeric', minute: '2-digit', hour12: true });
      return {
          timezone: interval.timezone,
          localStart: formatter.format(new Date(commonSlotResult!.start)),
          localEnd: formatter.format(new Date(commonSlotResult!.end)),
      }
  }) : [];


  return { commonSlot: commonSlotResult, individualSlots: individualSlotsFormatted, allTimezonesValid: allTimezonesProcessedSuccessfully };
};