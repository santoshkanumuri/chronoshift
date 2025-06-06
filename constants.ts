
import { MapHotspot } from './types';

export const WORLD_TIME_API_BASE_URL = 'https://worldtimeapi.org/api/timezone';

export const DEFAULT_FROM_TIMEZONE = 'America/New_York';
export const DEFAULT_TO_TIMEZONE = 'Europe/London';

export const LOCAL_STORAGE_PROFILE_KEY = 'chronoShiftProfiles';
export const LOCAL_STORAGE_THEME_KEY = 'chronoShiftTheme';

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const WORKING_HOURS_START = 9; // 9 AM
export const WORKING_HOURS_END = 17; // 5 PM (exclusive)

// Tailwind accent colors - ensure these are defined in tailwind.config.js or map to existing ones
export const ACCENT_COLORS: { [key: string]: string } = {
  morning: 'orange',
  afternoon: 'sky',
  evening: 'amber',
  night: 'slate',
  default: 'primary-light', // Fallback, maps to a config color
  dark: 'primary-dark' // Fallback for dark mode, maps to a config color
};

// Placeholder - replace with an actual accessible image URL or local asset path
export const WORLD_MAP_IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg'; 

export const MAP_HOTSPOTS: MapHotspot[] = [
  { id: 'london', name: 'London, UK', timezone: 'Europe/London', x: 49.5, y: 34 },
  { id: 'new-york', name: 'New York, USA', timezone: 'America/New_York', x: 28, y: 38.5 },
  { id: 'tokyo', name: 'Tokyo, Japan', timezone: 'Asia/Tokyo', x: 83, y: 39.5 },
  { id: 'sydney', name: 'Sydney, Australia', timezone: 'Australia/Sydney', x: 87, y: 74 },
  { id: 'los-angeles', name: 'Los Angeles, USA', timezone: 'America/Los_Angeles', x: 18, y: 40.5 },
  { id: 'paris', name: 'Paris, France', timezone: 'Europe/Paris', x: 50.5, y: 36 },
  { id: 'moscow', name: 'Moscow, Russia', timezone: 'Europe/Moscow', x: 59, y: 32.5 },
  { id: 'dubai', name: 'Dubai, UAE', timezone: 'Asia/Dubai', x: 63.5, y: 47.5 },
  { id: 'sao-paulo', name: 'São Paulo, Brazil', timezone: 'America/Sao_Paulo', x: 35.5, y: 70 },
  { id: 'beijing', name: 'Beijing, China', timezone: 'Asia/Shanghai', x: 77.5, y: 38.5 },
  { id: 'delhi', name: 'New Delhi, India', timezone: 'Asia/Kolkata', x: 69.5, y: 44.5 },
  { id: 'cairo', name: 'Cairo, Egypt', timezone: 'Africa/Cairo', x: 56.5, y: 44 },
  { id: 'johannesburg', name: 'Johannesburg, SA', timezone: 'Africa/Johannesburg', x: 56, y: 71.5 },
  { id: 'buenos-aires', name: 'Buenos Aires, Arg.', timezone: 'America/Argentina/Buenos_Aires', x: 32, y: 75.5 },
  { id: 'mexico-city', name: 'Mexico City, Mex.', timezone: 'America/Mexico_City', x: 22.5, y: 49.5 },
];
// Note: X/Y coordinates are approximate percentages and will need fine-tuning based on the map image.
// Ensure these timezones exist in the list fetched from worldtimeapi.org.
// Some timezones like 'Asia/Shanghai' represent a broader region (e.g., all of China).
// 'America/Argentina/Buenos_Aires' is a more specific example.
