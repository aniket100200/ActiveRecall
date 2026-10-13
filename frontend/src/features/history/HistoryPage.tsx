import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchCompletedRevisionsHistory, fetchStudySessionsHistory } from '../../api/dashboardApi';
import { RevisionTaskDetailDto } from '../../api/revisionApi';
import { StudySessionDto } from '../../api/studySessionApi';
import {
  History as HistoryIcon,
  CheckCircle2,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';

export function HistoryPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'REVISIONS' | 'SESSIONS'>('REVISIONS');

  const [completedTasks, setCompletedTasks] = useState<RevisionTaskDetailDto[]>([]);
  const [studySessions, setStudySessions] = useState<StudySessionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === 'REVISIONS') {
        const res = await fetchCompletedRevisionsHistory(token);
        setCompletedTasks(res.content || []);
      } else {
        const res = await fetchStudySessionsHistory(token);
        setStudySessions(res.content || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load history');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const outcomeBadge = (outcome?: string) => {
    switch (outcome) {
      case 'AGAIN':
        return 'bg-rose-100 text-rose-800';
      case 'HARD':
        return 'bg-amber-100 text-amber-800';
      case 'GOOD':
        return 'bg-sky-100 text-sky-800';
      case 'EASY':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
          <HistoryIcon className="w-7 h-7 text-sky-600" />
          <span>Revision &amp; Study History</span>
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Inspect past recall performance outcomes and logged study sessions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('REVISIONS')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'REVISIONS'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Completed Revisions</span>
        </button>

        <button
          onClick={() => setActiveTab('SESSIONS')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'SESSIONS'
              ? 'border-sky-600 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Study Sessions Log</span>
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : activeTab === 'REVISIONS' ? (
        completedTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No completed revisions yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Complete tasks from your Due Today queue to start recording your active recall progress.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.map((task) => {
              const completedFormatted = task.completedAt
                ? new Date(task.completedAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recently';

              return (
                <div
                  key={task.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {task.subjectName}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{task.topicName}</span>
                      <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded">
                        Day {task.scheduleOffsetDays} Offset
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">
                      {task.sessionTitle || `${task.topicName} Revision`}
                    </h3>

                    {task.reflection && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                        &ldquo;{task.reflection}&rdquo;
                      </p>
                    )}

                    <p className="text-xs text-slate-400 flex items-center space-x-1 pt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Completed on {completedFormatted}</span>
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold self-start sm:self-center ${outcomeBadge(
                      task.outcome
                    )}`}
                  >
                    Outcome: {task.outcome}
                  </span>
                </div>
              );
            })}
          </div>
        )
      ) : studySessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No study sessions logged yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Log when you study a topic to automatically generate spaced repetition revision schedules.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {studySessions.map((session) => {
            const studiedFormatted = new Date(session.studiedAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {session.subjectName}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{session.topicName}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1">
                      {session.title || `${session.topicName} Study Session`}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-3 text-xs text-slate-500">
                    {session.durationMinutes && (
                      <span className="flex items-center space-x-1 font-medium bg-slate-100 px-2.5 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{session.durationMinutes} mins</span>
                      </span>
                    )}
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{studiedFormatted}</span>
                    </span>
                  </div>
                </div>

                {session.notes && (
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {session.notes}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs font-medium text-slate-400 mr-1 self-center">Generated Revisions:</span>
                  {session.revisionTasks.map((task) => (
                    <span
                      key={task.id}
                      className={`text-xs px-2 py-0.5 rounded font-semibold ${
                        task.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Day {task.scheduleOffsetDays} ({task.status})
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
