import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  fetchRevisionTask,
  completeRevisionTask,
  RevisionTaskDetailDto,
  RevisionOutcome,
} from '../../api/revisionApi';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export function ActiveRecallPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [task, setTask] = useState<RevisionTaskDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showNotes, setShowNotes] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<RevisionOutcome | null>(null);
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTask = useCallback(async () => {
    if (!token || !taskId) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchRevisionTask(token, taskId);
      setTask(data);
      if (data.outcome) {
        setSelectedOutcome(data.outcome);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load revision task');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleSubmit = async () => {
    if (!token || !taskId || !selectedOutcome) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await completeRevisionTask(token, taskId, {
        outcome: selectedOutcome,
        reflection: reflection || undefined,
      });
      navigate('/app/revisions', { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to complete revision task');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="h-80 bg-white rounded-2xl border border-slate-200 animate-pulse max-w-2xl mx-auto" />;
  }

  if (error || !task) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Link to="/app/revisions" className="inline-flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Revision Queue</span>
        </Link>
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error || 'Task not found'}</span>
        </div>
      </div>
    );
  }

  const outcomes: { id: RevisionOutcome; label: string; sub: string; color: string; hover: string; border: string }[] = [
    { id: 'AGAIN', label: 'Again', sub: 'Forgot completely', color: 'bg-rose-50 text-rose-800', hover: 'hover:bg-rose-100', border: 'border-rose-300' },
    { id: 'HARD', label: 'Hard', sub: 'Remembered with effort', color: 'bg-amber-50 text-amber-800', hover: 'hover:bg-amber-100', border: 'border-amber-300' },
    { id: 'GOOD', label: 'Good', sub: 'Remembered correctly', color: 'bg-sky-50 text-sky-800', hover: 'hover:bg-sky-100', border: 'border-sky-300' },
    { id: 'EASY', label: 'Easy', sub: 'Instant recall', color: 'bg-emerald-50 text-emerald-800', hover: 'hover:bg-emerald-100', border: 'border-emerald-300' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/app/revisions"
        className="inline-flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Revision Queue</span>
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Header Info */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded">
              {task.subjectName}
            </span>
            <span className="text-xs font-medium text-slate-500">&bull;</span>
            <span className="text-xs font-semibold text-slate-700">{task.topicName}</span>
            <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded">
              {task.scheduleOffsetDays === 0 ? 'Day 0 (Immediate)' : `Day ${task.scheduleOffsetDays} Revision`}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            {task.sessionTitle || `${task.topicName} Revision`}
          </h1>
        </div>

        {/* Active Recall Prompt Box */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-4">
          <HelpCircle className="w-10 h-10 text-sky-600 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Attempt Active Recall</h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mt-1">
              Before revealing your notes, pause and try to retrieve the key concepts, formulas, or summaries in your mind.
            </p>
          </div>

          <button
            onClick={() => setShowNotes(!showNotes)}
            className="inline-flex items-center space-x-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-sm"
          >
            {showNotes ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
            <span>{showNotes ? 'Hide Notes' : 'Reveal Notes & Summary'}</span>
          </button>
        </div>

        {/* Revealed Notes */}
        {showNotes && (
          <div className="bg-sky-50/70 p-5 rounded-xl border border-sky-100 space-y-2 animate-fadeIn">
            <h4 className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Saved Notes &amp; Learning Summary</span>
            </h4>
            <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {task.sessionNotes || 'No detailed notes saved for this study session.'}
            </p>
          </div>
        )}

        {/* Outcome Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-900">
            How well did you recall this material?
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {outcomes.map((o) => {
              const isSelected = selectedOutcome === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelectedOutcome(o.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${o.color} ${o.hover} ${
                    isSelected ? `ring-2 ring-sky-600 font-bold border-transparent shadow` : o.border
                  }`}
                >
                  <div>
                    <p className="font-bold text-sm">{o.label}</p>
                    <p className="text-xs opacity-80 mt-0.5">{o.sub}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-sky-600 self-end mt-2" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Short Reflection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Short Reflection (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Need to review formula 3 again tomorrow..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        {/* Complete CTA */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={!selectedOutcome || isSubmitting}
            onClick={handleSubmit}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm shadow-sm disabled:opacity-50 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Outcome...' : 'Complete Revision'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
