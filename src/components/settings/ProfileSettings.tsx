import React, { useEffect, useReducer } from 'react';
import { FormField } from '../common/forms/FormField';

// Types
export interface ProfileSettingsValues {
  visibility: 'public' | 'members' | 'private';
  showEmail: boolean;
  emailDigest: 'off' | 'daily' | 'weekly';
  eventReminders: boolean;
}

interface ProfileSettingsProps {
  userId: string;
  onChange?: (values: ProfileSettingsValues) => void;
}

interface State extends ProfileSettingsValues {
  saved: boolean;
  dirty: boolean;
}

type Action =
  | { type: 'SET_ALL'; payload: ProfileSettingsValues }
  | { type: 'UPDATE'; field: keyof ProfileSettingsValues; value: any }
  | { type: 'MARK_SAVED' };

const defaultValues: ProfileSettingsValues = {
  visibility: 'members',
  showEmail: false,
  emailDigest: 'weekly',
  eventReminders: true,
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, ...action.payload, dirty: false, saved: false };
    case 'UPDATE':
      return { ...state, [action.field]: action.value, dirty: true, saved: false };
    case 'MARK_SAVED':
      return { ...state, dirty: false, saved: true };
    default:
      return state;
  }
};

const STORAGE_KEY = (userId: string) => `profile-settings-${userId}`;

export const loadStoredSettings = (userId: string): ProfileSettingsValues | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persistSettings = (userId: string, values: ProfileSettingsValues) => {
  try { localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(values)); } catch {}
};

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId, onChange }) => {
  const initial = loadStoredSettings(userId) || defaultValues;
  const [state, dispatch] = useReducer(reducer, { ...initial, saved: false, dirty: false });

  // Persist & external notify when state changes and is dirty
  useEffect(() => {
    if (!state.dirty) return;
    const toSave: ProfileSettingsValues = {
      visibility: state.visibility,
      showEmail: state.showEmail,
      emailDigest: state.emailDigest,
      eventReminders: state.eventReminders,
    };
    persistSettings(userId, toSave);
    onChange?.(toSave);
    // Simulate async save success indicator
    const t = setTimeout(() => dispatch({ type: 'MARK_SAVED' }), 450);
    return () => clearTimeout(t);
  }, [state.visibility, state.showEmail, state.emailDigest, state.eventReminders, state.dirty, onChange, userId]);

  const update = <K extends keyof ProfileSettingsValues>(field: K, value: ProfileSettingsValues[K]) => {
    dispatch({ type: 'UPDATE', field, value });
  };

  return (
    <div className="settings-panel" aria-label="Profile Settings">
      <h3 className="panel-title">Profile Settings</h3>
      <p className="panel-subtitle">Control visibility and communication preferences.</p>

      <div className="settings-groups">
        {/* Visibility */}
        <div className="settings-group">
          <h4 className="group-title">Privacy & Visibility</h4>
          <div className="group-body">
            <FormField id="visibility" label="Profile Visibility" helpText="Who can view your profile details?">
              <select value={state.visibility} onChange={e => update('visibility', e.target.value as any)}>
                <option value="public">Public</option>
                <option value="members">Members Only</option>
                <option value="private">Private</option>
              </select>
            </FormField>
            <FormField id="showEmail" label="Show Email" helpText="Display your email on your public profile?">
              <input type="checkbox" checked={state.showEmail} onChange={e => update('showEmail', e.target.checked)} />
            </FormField>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-group">
          <h4 className="group-title">Notifications</h4>
          <div className="group-body">
            <FormField id="emailDigest" label="Email Digest" helpText="Summary email frequency">
              <select value={state.emailDigest} onChange={e => update('emailDigest', e.target.value as any)}>
                <option value="off">Off</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </FormField>
            <FormField id="eventReminders" label="Event Reminders" helpText="Receive upcoming event reminders">
              <input type="checkbox" checked={state.eventReminders} onChange={e => update('eventReminders', e.target.checked)} />
            </FormField>
          </div>
        </div>

        {/* Status Row */}
        <div className="settings-status-row" aria-live="polite">
          {state.dirty && !state.saved && <span className="settings-status dirty">Saving changes...</span>}
          {state.saved && !state.dirty && <span className="settings-status saved">✅ Preferences saved</span>}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
