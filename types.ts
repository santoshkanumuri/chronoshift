
export interface WorldTimeApiResponse {
  abbreviation: string;
  client_ip: string;
  datetime: string;
  day_of_week: number;
  day_of_year: number;
  dst: boolean;
  dst_from: string | null;
  dst_offset: number;
  dst_until: string | null;
  raw_offset: number;
  timezone: string;
  unixtime: number;
  utc_datetime: string;
  utc_offset: string;
  week_number: number;
}

export interface DisplayTimeData {
  id: string;
  locationName: string;
  abbreviation: string;
  timeString: string;
  dateString?: string; // For day changes
  dayDifference?: string; // e.g. "(Next Day)"
  isDstActive: boolean;
  dstTooltip: string;
  eventHorizonText: string;
  timeWarpHtml: string; // Keep as string if using innerHTML, or structure for React
  healthScore?: { class: string; label: string; score: number };
  differenceText?: string;
  isSource?: boolean;
  utcOffset: string; // Raw UTC offset string e.g. "+01:00"
  timezone: string; // Full timezone identifier
  hourInTargetZone: number | null;
}

export interface Profile {
  id: string;
  name: string;
  fromTimezone: string;
  targetTimezones: string[];
}

export interface TimezoneHealth {
  score: number;
  class: string;
  label: string;
}

export interface MeetingSlot {
  start: number; // UTC timestamp
  end: number; // UTC timestamp
}

export interface TimezoneWorkingHours {
  timezone: string;
  startUTC: number;
  endUTC: number;
}

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
}

export enum TimeOfDay {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
  Night = 'night',
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface MapHotspot {
  id: string;
  name: string;
  timezone: string;
  x: number; // percentage for left position (0-100)
  y: number; // percentage for top position (0-100)
}
