import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchRevisions, RevisionQueueStatus, RevisionTaskDetailDto } from '../../api/revisionApi';
import { fetchSubjects, fetchTopicsBySubject, SubjectDto, TopicDto } from '../../api/subjectApi';
import {
  Repeat,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  BookOpen,
  Filter,
} from 'lucide-react';

export function RevisionsPage() {
  const { token } = useAuth();
  const [activeQueue, setActiveQueue] = useState<RevisionQueueStatus>('DUE_TODAY');
  const [tasks, setTasks] = useState<RevisionTaskDetailDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [topics, setTopics] = useState<TopicDto[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

  useEffect(() => {
    async function loadSubjects() {
      if (!token) return;
      try {
        const res = await fetchSubjects(token);
        setSubjects(res.content || []);
      } catch {
        // Ignore filter metadata error
      }
    }
    loadSubjects();
  }, [token]);

  useEffect(() => {
    async function loadTopics() {
      if (!token || !selectedSubjectId) {
        setTopics([]);
        return;
      }
      try {
        const list = await fetchTopicsBySubject(token, selectedSubjectId);
        setTopics(list);
      } catch {
        setTopics([]);
      }
    }
    loadTopics();
  }, [token, selectedSubjectId]);

  const loadRevisions = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchRevisions(
        token,
        activeQueue,
        selectedSubjectId || undefined,
        selectedTopicId || undefined
      );
      setTasks(data.content || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load revision queue');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, activeQueue, selectedSubjectId, selectedTopicId]);

  useEffect(() => {
    loadRevisions();
  }, [loadRevisions]);

  const queues: { id: RevisionQueueStatus; label: string; icon: typeof Clock; color: string }[] = [
    { id: 'DUE_TODAY', label: 'Due Today', icon: Clock, color: 'text-sky-600' },
    { id: 'OVERDUE', label: 'Overdue', icon: AlertCircle, color: 'text-rose-600' },
    { id: 'UPCOMING', label: 'Upcoming', icon: Calendar, color: 'text-amber-600' },
    { id: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
          <Repeat className="w-7 h-7 text-sky-600" />
          <span>Active Recall Revision Queue</span>
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Review tasks scheduled for today or inspect upcoming and completed revisions.
        </p>
      </div>

      {/* Queue Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-2 sm:space-x-8">
        {queues.map((q) => {
          const Icon = q.icon;
          const isActive = activeQueue === q.id;
          return (
            <button
              key={q.id}
              onClick={() => setActiveQueue(q.id)}
              className={`pb-3 px-1 text-sm font-semibold flex items-center space-x-2 whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{q.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
          <Filter className="w-4 h-4 text-slate-400" />
          <span>Filters:</span>
        </div>

        <select
          value={selectedSubjectId}
          onChange={(e) => {
            setSelectedSubjectId(e.target.value);
            setSelectedTopicId('');
          }}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          disabled={!selectedSubjectId}
          value={selectedTopicId}
          onChange={(e) => setSelectedTopicId(e.target.value)}
          className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 bg-white disabled:bg-slate-50 disabled:text-slate-400"
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Task List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 animate-pulse h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            No tasks in {queues.find((q) => q.id === activeQueue)?.label}
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            {activeQueue === 'DUE_TODAY'
              ? "You're all caught up on revisions due today! Log a new study session to schedule future tasks."
              : 'No revision tasks matched your selected filter.'}
          </p>
          <Link
            to="/app/sessions/new"
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Log a Study Session</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const dueFormatted = new Date(task.dueAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={task.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-sky-300 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {task.subjectName}
                    </span>
                    <span className="text-xs font-medium text-slate-500">&bull;</span>
                    <span className="text-xs font-semibold text-slate-700">{task.topicName}</span>
                    <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded">
                      {task.scheduleOffsetDays === 0 ? 'Day 0 (Immediate)' : `Day ${task.scheduleOffsetDays} Revision`}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {task.sessionTitle || `${task.topicName} Study Session`}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due: {dueFormatted}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {task.status === 'PENDING' ? (
                    <Link
                      to={`/app/revisions/${task.id}`}
                      className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Start Recall</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Outcome: {task.outcome}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
