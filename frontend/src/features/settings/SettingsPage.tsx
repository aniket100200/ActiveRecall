import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchRevisionSchedule, updateRevisionSchedule } from '../../api/settingsApi';
import { Settings, User as UserIcon, Clock, Check, AlertCircle } from 'lucide-react';

export function SettingsPage() {
  const { user, token } = useAuth();

  const [offsetsInput, setOffsetsInput] = useState('0, 3, 7, 14, 21');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadSettings() {
      if (!token) return;
      setIsLoading(true);
      try {
        const res = await fetchRevisionSchedule(token);
        if (res.scheduleOffsetsDays) {
          setOffsetsInput(res.scheduleOffsetsDays.join(', '));
        }
      } catch {
        setMessage({ type: 'error', text: 'Failed to load schedule settings' });
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, [token]);

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setMessage(null);
    setIsSaving(true);

    try {
      const parsedOffsets = offsetsInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .map(Number);

      if (parsedOffsets.some(isNaN)) {
        throw new Error('Please enter valid integers separated by commas.');
      }

      const updated = await updateRevisionSchedule(token, parsedOffsets);
      setOffsetsInput(updated.scheduleOffsetsDays.join(', '));
      setMessage({ type: 'success', text: 'Revision schedule offsets updated successfully!' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage({ type: 'error', text: err.message });
      } else {
        setMessage({ type: 'error', text: 'Failed to update revision schedule' });
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
          <Settings className="w-7 h-7 text-sky-600" />
          <span>Account &amp; Revision Settings</span>
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Manage your profile preferences and spaced repetition schedule.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          {message.type === 'success' ? (
            <Check className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <UserIcon className="w-5 h-5 text-sky-600" />
          <span>Profile Information</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 font-medium">Display Name</p>
            <p className="text-slate-900 font-semibold">{user?.name}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Email Address</p>
            <p className="text-slate-900 font-semibold">{user?.email}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Configured Time Zone</p>
            <p className="text-slate-900 font-semibold">{user?.timeZone}</p>
          </div>
        </div>
      </div>

      {/* Revision Schedule Configuration */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-sky-600" />
          <span>Spaced Repetition Intervals</span>
        </h2>
        <p className="text-slate-600 text-sm">
          Define the calendar day offsets relative to a study session when revision tasks should be scheduled.
        </p>

        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Schedule Offsets (Days, comma-separated)
            </label>
            <input
              type="text"
              required
              value={offsetsInput}
              onChange={(e) => setOffsetsInput(e.target.value)}
              placeholder="0, 3, 7, 14, 21"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Default: <strong>0, 3, 7, 14, 21</strong> (Day 0 means due immediately on the study date).
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Schedule Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
