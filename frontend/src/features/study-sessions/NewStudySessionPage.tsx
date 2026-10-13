import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchSubjects, fetchTopicsBySubject, SubjectDto, TopicDto } from '../../api/subjectApi';
import { createStudySession } from '../../api/studySessionApi';
import { fetchRevisionSchedule } from '../../api/settingsApi';
import { BookOpen, Calendar, Clock, Sparkles, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function NewStudySessionPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTopicId = searchParams.get('topicId') || '';

  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [topics, setTopics] = useState<TopicDto[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>(initialTopicId);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [studiedAtLocal, setStudiedAtLocal] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [scheduleOffsets, setScheduleOffsets] = useState<number[]>([0, 3, 7, 14, 21]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Subjects and user schedule offsets on mount
  useEffect(() => {
    async function init() {
      if (!token) return;
      try {
        const [subjRes, schedRes] = await Promise.all([
          fetchSubjects(token),
          fetchRevisionSchedule(token).catch(() => ({ scheduleOffsetsDays: [0, 3, 7, 14, 21], updatedAt: '' })),
        ]);
        setSubjects(subjRes.content || []);
        if (schedRes.scheduleOffsetsDays) {
          setScheduleOffsets(schedRes.scheduleOffsetsDays);
        }
      } catch {
        setError('Failed to load form metadata');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [token]);

  // Load Topics when Subject changes
  const loadTopicsForSubject = useCallback(async (subjId: string) => {
    if (!token || !subjId) {
      setTopics([]);
      return;
    }
    try {
      const data = await fetchTopicsBySubject(token, subjId);
      setTopics(data);
      if (initialTopicId) {
        const match = data.find((t) => t.id === initialTopicId);
        if (match) setSelectedTopicId(match.id);
      }
    } catch {
      setTopics([]);
    }
  }, [token, initialTopicId]);

  useEffect(() => {
    if (selectedSubjectId) {
      loadTopicsForSubject(selectedSubjectId);
    }
  }, [selectedSubjectId, loadTopicsForSubject]);

  // If initialTopicId was passed, find its parent subject
  useEffect(() => {
    if (initialTopicId && subjects.length > 0 && !selectedSubjectId) {
      // Find subject for this topic
      for (const subj of subjects) {
        fetchTopicsBySubject(token!, subj.id).then((topList) => {
          if (topList.some((t) => t.id === initialTopicId)) {
            setSelectedSubjectId(subj.id);
            setTopics(topList);
            setSelectedTopicId(initialTopicId);
          }
        });
      }
    }
  }, [initialTopicId, subjects, selectedSubjectId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedTopicId) {
      setError('Please select a valid subject and topic.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const studiedAtIso = new Date(studiedAtLocal).toISOString();
      await createStudySession(token, selectedTopicId, {
        title: title || undefined,
        notes: notes || undefined,
        studiedAt: studiedAtIso,
        durationMinutes: Number(durationMinutes) || undefined,
      });

      navigate(`/app/topics/${selectedTopicId}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to record study session');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/app/subjects"
        className="inline-flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Subjects</span>
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-7 h-7 text-sky-600" />
            <span>Record Study Session</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Log your study details to generate automated active recall revision tasks.
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject & Topic Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subject <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  setSelectedTopicId('');
                }}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white"
              >
                <option value="">Select a Subject...</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Topic <span className="text-rose-500">*</span>
              </label>
              <select
                required
                disabled={!selectedSubjectId}
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">Select a Topic...</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Session Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Session Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Percentage Formulas & Practice Problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Date & Time / Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center space-x-1">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Studied Date &amp; Time</span>
              </label>
              <input
                type="datetime-local"
                required
                value={studiedAtLocal}
                onChange={(e) => setStudiedAtLocal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center space-x-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Duration (Minutes)</span>
              </label>
              <input
                type="number"
                min={0}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Session Notes / Summary */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notes / Learning Summary
            </label>
            <textarea
              rows={4}
              placeholder="Key concepts learned, formulas, or answers to test yourself on during recall..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Live Schedule Preview Box */}
          <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 space-y-2">
            <div className="flex items-center space-x-2 text-sky-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Automated Revision Schedule Generated:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {scheduleOffsets.map((offset) => (
                <span
                  key={offset}
                  className="bg-white text-sky-800 text-xs font-semibold px-3 py-1 rounded-full border border-sky-200 flex items-center space-x-1 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>
                    {offset === 0 ? 'Day 0 (Immediate)' : `Day ${offset} Revision`}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Session...' : 'Log Study & Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
