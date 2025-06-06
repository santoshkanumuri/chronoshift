
import { Profile } from '../types';
import { LOCAL_STORAGE_PROFILE_KEY } from '../constants';

export const getProfiles = (): Profile[] => {
  const profilesJson = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
  return profilesJson ? JSON.parse(profilesJson) : [];
};

export const saveProfile = (profile: Omit<Profile, 'id'>): Profile => {
  const profiles = getProfiles();
  const newProfile: Profile = { ...profile, id: new Date().toISOString() }; // Simple unique ID
  profiles.push(newProfile);
  localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profiles));
  return newProfile;
};

export const updateProfile = (updatedProfile: Profile): Profile | null => {
  let profiles = getProfiles();
  const index = profiles.findIndex(p => p.id === updatedProfile.id);
  if (index !== -1) {
    profiles[index] = updatedProfile;
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profiles));
    return updatedProfile;
  }
  return null;
};

export const deleteProfile = (profileId: string): boolean => {
  let profiles = getProfiles();
  const initialLength = profiles.length;
  profiles = profiles.filter(p => p.id !== profileId);
  if (profiles.length < initialLength) {
    localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profiles));
    return true;
  }
  return false;
};