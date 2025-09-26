import React, { useReducer, useEffect } from 'react';
import { FormField } from '../common/forms/FormField';
import type { ProfileSettings } from '../../types';
import ProfilesService from '../../services/profilesService';

/**
 * UI-First Implementation (Phase 4 precursor):
 * This component provides the full settings form aligned with the ProfileSettings type.
 * Now refactored to use ProfilesService.getSettings / updateSettings (single source of truth).
 */

// NOTE: default values now come from ProfilesService.getSettings (which seeds localStorage if absent)

interface PanelProps {
  userId: string;
  onChange?: (settings: ProfileSettings) => void;
  readOnly?: boolean; // allow parent to force view mode later
}

interface State {
  settings: ProfileSettings | null;
  dirty: boolean;
  saving: boolean;
  savedAt?: number;
  loading: boolean;
  error?: string | null;
}

type Action =
  | { type: 'SET_ALL'; payload: ProfileSettings }
  | { type: 'UPDATE'; field: keyof ProfileSettings; value: any }
  | { type: 'UPDATE_NESTED'; section: keyof ProfileSettings; field: string; value: any }
  | { type: 'BEGIN_SAVE' }
  | { type: 'FINISH_SAVE' }
  | { type: 'LOADING' }
  | { type: 'LOADED'; payload: ProfileSettings }
  | { type: 'ERROR'; error: string };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ALL':
      return { ...state, settings: action.payload, dirty: false, saving: false, loading: false };
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOADED':
      return { ...state, settings: action.payload, loading: false, dirty: false, saving: false };
    case 'ERROR':
      return { ...state, error: action.error, loading: false };
    case 'UPDATE': {
      if (!state.settings) return state;
      const updated = { ...state.settings, [action.field]: action.value, updatedAt: new Date().toISOString() } as ProfileSettings;
      return { ...state, settings: updated, dirty: true };
    }
    case 'UPDATE_NESTED': {
      if (!state.settings) return state;
      const section = action.section as 'notifications';
      const nested = { ...(state.settings as any)[section], [action.field]: action.value };
      const updated = { ...state.settings, [section]: nested, updatedAt: new Date().toISOString() } as ProfileSettings;
      return { ...state, settings: updated, dirty: true };
    }
    case 'BEGIN_SAVE':
      return { ...state, saving: true };
    case 'FINISH_SAVE':
      return { ...state, saving: false, dirty: false, savedAt: Date.now() };
    default:
      return state;
  }
};

export const ProfileSettingsPanel: React.FC<PanelProps> = ({ userId, onChange, readOnly }) => {
  const [state, dispatch] = useReducer(reducer, undefined!, () => ({
    settings: null,
    dirty: false,
    saving: false,
    savedAt: undefined,
    loading: true,
    error: null,
  }));

  // Initial load
  useEffect(() => {
    let active = true;
    (async () => {
      dispatch({ type: 'LOADING' });
      try {
        const s = await ProfilesService.getSettings(userId);
        if (!active) return;
        dispatch({ type: 'LOADED', payload: s });
      } catch (e:any) {
        if (!active) return;
        dispatch({ type: 'ERROR', error: e?.message || 'Failed to load settings' });
      }
    })();
    return () => { active = false; };
  }, [userId]);

  // Auto-save when dirty (debounced simulation)
  useEffect(() => {
    if (!state.dirty || !state.settings) return;
    let cancelled = false;
    dispatch({ type: 'BEGIN_SAVE' });
    const run = async () => {
      try {
        const persisted = await ProfilesService.updateSettings(userId, state.settings!);
        if (cancelled) return;
        onChange?.(persisted);
      } finally {
        if (!cancelled) {
          setTimeout(() => dispatch({ type: 'FINISH_SAVE' }), 300);
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [state.dirty, state.settings, onChange, userId]);

  const update = <K extends keyof ProfileSettings>(field: K, value: ProfileSettings[K]) => {
    if (readOnly) return;
    dispatch({ type: 'UPDATE', field, value });
  };
  const updateNotifications = (field: keyof ProfileSettings['notifications'], value: any) => {
    if (readOnly) return;
    dispatch({ type: 'UPDATE_NESTED', section: 'notifications', field, value });
  };

  const { settings } = state;

  if (state.loading) {
    return <div className="settings-panel" aria-label="Advanced Profile Settings"><p>Loading settings...</p></div>;
  }
  if (state.error) {
    return <div className="settings-panel" aria-label="Advanced Profile Settings"><p role="alert">{state.error}</p></div>;
  }
  if (!settings) return null;

  return (
    <div className="settings-panel" aria-label="Advanced Profile Settings">
      <h3 className="panel-title">Profile Settings</h3>
      <p className="panel-subtitle">Manage privacy, notifications and personal preferences.</p>

      <div className="settings-groups">
        {/* Privacy / Visibility */}
        <div className="settings-group">
          <h4 className="group-title">Privacy & Visibility</h4>
          <div className="group-body">
            <FormField id="visibility" label="Profile Visibility" helpText="Who can view your profile details?">
              <select value={settings.visibility} disabled={readOnly} onChange={e => update('visibility', e.target.value as any)}>
                <option value="public">Public</option>
                <option value="alumni_only">Alumni Only</option>
                <option value="private">Private</option>
              </select>
            </FormField>
            <FormField id="showEmail" label="Show Email" helpText="Display your email on your public profile?">
              <input type="checkbox" checked={settings.showEmail} disabled={readOnly} onChange={e => update('showEmail', e.target.checked)} />
            </FormField>
            <FormField id="showEmployment" label="Show Employment" helpText="Display your company & role.">
              <input type="checkbox" checked={settings.showEmployment} disabled={readOnly} onChange={e => update('showEmployment', e.target.checked)} />
            </FormField>
            <FormField id="showMentorship" label="Show Mentorship" helpText="Expose mentorship participation.">
              <input type="checkbox" checked={settings.showMentorship} disabled={readOnly} onChange={e => update('showMentorship', e.target.checked)} />
            </FormField>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-group">
          <h4 className="group-title">Notifications</h4>
          <div className="group-body">
            <FormField id="emailMentorship" label="Mentorship Emails" helpText="Updates about your mentorship activity.">
              <input type="checkbox" checked={settings.notifications.emailMentorship} disabled={readOnly} onChange={e => updateNotifications('emailMentorship', e.target.checked)} />
            </FormField>
            <FormField id="emailOpportunities" label="Opportunities Emails" helpText="New career & project opportunities.">
              <input type="checkbox" checked={settings.notifications.emailOpportunities} disabled={readOnly} onChange={e => updateNotifications('emailOpportunities', e.target.checked)} />
            </FormField>
            <FormField id="emailEvents" label="Events Emails" helpText="Event announcements & reminders.">
              <input type="checkbox" checked={settings.notifications.emailEvents} disabled={readOnly} onChange={e => updateNotifications('emailEvents', e.target.checked)} />
            </FormField>
            <FormField id="digestFrequency" label="Digest Frequency" helpText="Summary email schedule.">
              <select value={settings.notifications.digestFrequency} disabled={readOnly} onChange={e => updateNotifications('digestFrequency', e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-group">
          <h4 className="group-title">Preferences</h4>
          <div className="group-body">
            <FormField id="theme" label="Theme" helpText="Display theme preference.">
              <select value={settings.theme} disabled={readOnly} onChange={e => update('theme', e.target.value as any)}>
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </FormField>
            <FormField id="timezone" label="Timezone" helpText="Used for scheduling & display.">
              <input type="text" value={settings.timezone || ''} disabled={readOnly} onChange={e => update('timezone', e.target.value)} />
            </FormField>
            <FormField id="language" label="Language" helpText="Interface language.">
              <select value={settings.language || 'en'} disabled={readOnly} onChange={e => update('language', e.target.value)}>
                <option value="en">English</option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Status / Save Feedback */}
        <div className="settings-status-row" aria-live="polite">
          {state.dirty && state.saving && <span className="settings-status dirty">Saving changes...</span>}
          {!state.dirty && !state.saving && state.savedAt && (
            <span className="settings-status saved" role="status">✅ Saved</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPanel;
