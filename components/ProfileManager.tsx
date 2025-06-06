
import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import * as profileService from '../services/profileService';

interface ProfileManagerProps {
  onProfileLoad: (profile: Profile) => void;
  currentFromTimezone: string; // Ensure this is always a string
  currentTargetTimezones: string[]; // Ensure this is always an array of strings
  disabled?: boolean;
  accentColor: string;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
  onProfileLoad,
  currentFromTimezone,
  currentTargetTimezones,
  disabled = false,
  accentColor
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [newProfileName, setNewProfileName] = useState<string>('');

  useEffect(() => {
    setProfiles(profileService.getProfiles());
  }, []);

  const refreshProfiles = () => {
    const updatedProfiles = profileService.getProfiles();
    setProfiles(updatedProfiles);
    // If the selected profile was deleted, reset selection
    if (selectedProfileId && !updatedProfiles.find(p => p.id === selectedProfileId)) {
      setSelectedProfileId('');
    }
  };

  const handleLoadProfile = () => {
    if (!selectedProfileId) {
      alert("Please select a profile to load.");
      return;
    }
    const profileToLoad = profiles.find(p => p.id === selectedProfileId);
    if (profileToLoad) {
      onProfileLoad(profileToLoad);
    }
  };

  const handleSaveProfile = () => {
    if (!newProfileName.trim()) {
      alert("Please enter a name for the new profile.");
      return;
    }
    if (!currentFromTimezone || currentTargetTimezones.some(tz => !tz || tz.length === 0)) {
        alert("Please ensure 'From' and all 'To' timezones are selected before saving a profile.");
        return;
    }
    if (currentTargetTimezones.length === 0) {
        alert("Please select at least one 'To' timezone to save in a profile.");
        return;
    }
    profileService.saveProfile({
      name: newProfileName.trim(),
      fromTimezone: currentFromTimezone,
      targetTimezones: currentTargetTimezones,
    });
    setNewProfileName('');
    refreshProfiles();
    alert("Profile saved successfully!");
  };

  const handleDeleteProfile = () => {
    if (!selectedProfileId) {
      alert("Please select a profile to delete.");
      return;
    }
    const profileToDelete = profiles.find(p => p.id === selectedProfileId);
    if (profileToDelete && window.confirm(`Are you sure you want to delete profile "${profileToDelete.name}"?`)) {
      profileService.deleteProfile(selectedProfileId);
      refreshProfiles(); // This will also reset selectedProfileId if it was deleted
      alert("Profile deleted successfully.");
    }
  };
  
  const accentClass = `bg-${accentColor}-500 hover:bg-${accentColor}-600 focus:ring-${accentColor}-400`;
  const borderAccentClass = `border-${accentColor}-500 focus:ring-${accentColor}-400`;
  const textAccentClass = `text-${accentColor}-600 dark:text-${accentColor}-400`;

  return (
    <div className="p-4 border border-input-border-light dark:border-input-border-dark rounded-lg mb-6 shadow bg-white dark:bg-slate-800">
      <h4 className={`text-lg font-semibold ${textAccentClass} mb-3 flex items-center`}>
        <i className="fas fa-dna mr-2"></i> Timezone DNA Profiles
      </h4>
      
      <div className="mb-3">
        <label htmlFor="profile-select" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">Load Profile:</label>
        <div className="flex gap-2">
          <select
            id="profile-select"
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(e.target.value)}
            disabled={disabled || profiles.length === 0}
            className="flex-grow p-2 border border-input-border-light dark:border-input-border-dark rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light dark:focus:ring-primary-dark dark:focus:border-primary-dark bg-input-bg-light dark:bg-input-bg-dark text-text-light dark:text-text-dark disabled:opacity-50"
          >
            <option value="">{profiles.length === 0 ? "No profiles saved" : "Select a profile"}</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={handleLoadProfile}
            disabled={disabled || !selectedProfileId}
            className={`${accentClass} text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm disabled:opacity-50 transition-colors`}
          >
            <i className="fas fa-upload mr-1"></i> Load
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="profile-name-input" className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">New Profile Name:</label>
        <input
          type="text"
          id="profile-name-input"
          value={newProfileName}
          onChange={(e) => setNewProfileName(e.target.value)}
          placeholder="E.g., My Work Team"
          disabled={disabled}
          className={`w-full p-2 border border-input-border-light dark:border-input-border-dark rounded-md shadow-sm focus:ring-1 ${borderAccentClass} bg-input-bg-light dark:bg-input-bg-dark text-text-light dark:text-text-dark disabled:opacity-50`}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={handleSaveProfile}
          disabled={disabled || !newProfileName.trim()}
          className={`${accentClass} text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm flex-1 disabled:opacity-50 transition-colors`}
        >
          <i className="fas fa-save mr-1"></i> Save Current
        </button>
        <button
          onClick={handleDeleteProfile}
          disabled={disabled || !selectedProfileId}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm flex-1 disabled:opacity-50 transition-colors"
        >
          <i className="fas fa-trash-alt mr-1"></i> Delete Selected
        </button>
      </div>
    </div>
  );
};

export default ProfileManager;
