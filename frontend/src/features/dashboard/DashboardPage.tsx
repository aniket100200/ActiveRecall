import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  fetchDashboardSummary,
  fetchUpcomingRevisions,
  DashboardSummaryDto,
} from '../../api/dashboardApi';
import { RevisionTaskDetailDto } from '../../api/revisionApi';
import {
  Clock,
  Calendar,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  PlayCircle,
  PlusCircle,
  Layers,
  Repeat,
  AlertCircle,
} from 'lucide-react';

export function DashboardPage() {
  const { user, token } = useAuth();

  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [upcoming, setUpcoming] = useState<RevisionTaskDetailDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const [sumData, upData] = await Promise.all([
        fetchDashboardSummary(token),
        fetchUpcomingRevisions(token, 5),
      ]);
      setSummary(sumData);
      setUpcoming(upData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load dashboard metrics');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
          <p className="text-slate-600 text-sm mt-1">
            Here is your daily revision dashboard and active recall overview.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/app/sessions/new"
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Study Session</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          to="/app/revisions"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex items-center space-x-4"
        >
          <div className="bg-sky-100 p-3 rounded-lg text-sky-700">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{summary?.tasksDueToday ?? 0}</p>
            <p className="text-xs font-medium text-slate-500">Due Today</p>
          </div>
        </Link>

        <Link
          to="/app/revisions"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-rose-300 transition-all flex items-center space-x-4"
        >
          <div className="bg-rose-100 p-3 rounded-lg text-rose-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{summary?.overdueTasks ?? 0}</p>
            <p className="text-xs font-medium text-slate-500">Overdue Tasks</p>
          </div>
        </Link>

        <Link
          to="/app/history"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all flex items-center space-x-4"
        >
          <div className="bg-emerald-100 p-3 rounded-lg text-emerald-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{summary?.tasksCompletedToday ?? 0}</p>
            <p className="text-xs font-medium text-slate-500">Completed Today</p>
          </div>
        </Link>

        <Link
          to="/app/history"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all flex items-center space-x-4"
        >
          <div className="bg-amber-100 p-3 rounded-lg text-amber-700">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{summary?.totalStudySessions ?? 0}</p>
            <p className="text-xs font-medium text-slate-500">Total Sessions</p>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-700">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{summary?.completionRate ?? 0}%</p>
            <p className="text-xs font-medium text-slate-500">Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Upcoming Revisions Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <span>Next Revisions Due</span>
          </h2>
          <Link to="/app/revisions" className="text-sm font-semibold text-sky-600 hover:text-sky-500">
            View Queue &rarr;
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No pending revisions</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Log study sessions for your subjects to trigger automatic spaced repetition tasks.
            </p>
            <div className="flex justify-center space-x-3">
              <Link
                to="/app/subjects"
                className="inline-flex items-center space-x-1 border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Browse Subjects</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {upcoming.map((task) => {
              const dueFormatted = new Date(task.dueAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="text-xs font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded">
                        {task.subjectName}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{task.topicName}</span>
                    </div>
                    <p className="font-semibold text-sm text-slate-900">
                      {task.sessionTitle || `${task.topicName} Revision`}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Due: {dueFormatted}</span>
                    </p>
                  </div>

                  <Link
                    to={`/app/revisions/${task.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Recall</span>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/app/revisions"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex items-center space-x-3"
        >
          <div className="bg-sky-50 p-2.5 rounded-lg text-sky-600">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Revision Queue</h3>
            <p className="text-xs text-slate-500">Practice active recall for pending tasks</p>
          </div>
        </Link>

        <Link
          to="/app/subjects"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex items-center space-x-3"
        >
          <div className="bg-sky-50 p-2.5 rounded-lg text-sky-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Subjects &amp; Topics</h3>
            <p className="text-xs text-slate-500">Manage curriculum &amp; learning areas</p>
          </div>
        </Link>

        <Link
          to="/app/history"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex items-center space-x-3"
        >
          <div className="bg-sky-50 p-2.5 rounded-lg text-sky-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-900">Revision History</h3>
            <p className="text-xs text-slate-500">Review completed tasks and reflections</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
