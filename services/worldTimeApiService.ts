
import { WORLD_TIME_API_BASE_URL } from '../constants';
import { WorldTimeApiResponse } from '../types';

const robustFetch = async <T,>(url: string, options: RequestInit = {}, retries = 2, initialTimeout = 10000): Promise<T> => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), initialTimeout * Math.pow(2, attempt));

      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText} for URL: ${url}`);
      }
      return await response.json() as T;
    } catch (error: any) {
      console.warn(`Fetch attempt ${attempt + 1} for ${url} failed:`, error.message);
      if (attempt === retries || (error.name === 'AbortError' && attempt > 0)) {
        console.error(`All fetch attempts failed for ${url}. Last error:`, error);
        throw error;
      }
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw new Error(`Exhausted retries for ${url}`); // Should not be reached if loop logic is correct
};

export const fetchTimezoneList = async (): Promise<string[]> => {
  try {
    const timezones = await robustFetch<string[]>(WORLD_TIME_API_BASE_URL);
    if (!Array.isArray(timezones) || timezones.length === 0) {
        throw new Error("Received an empty or invalid timezone list from API.");
    }
    return timezones;
  } catch (error) {
    console.error("Failed to fetch timezone list:", error);
    throw error; // Re-throw to be handled by caller
  }
};

export const fetchTimezoneData = async (timezoneIdentifier: string): Promise<WorldTimeApiResponse | null> => {
  if (!timezoneIdentifier) {
    console.warn("fetchTimezoneData: timezoneIdentifier is null or empty");
    return null;
  }
  try {
    return await robustFetch<WorldTimeApiResponse>(`${WORLD_TIME_API_BASE_URL}/${timezoneIdentifier}`);
  } catch (error) {
    console.error(`Failed to fetch data for ${timezoneIdentifier} after retries:`, error);
    return null; 
  }
};