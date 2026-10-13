import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  fetchSubject,
  fetchTopicsBySubject,
  createTopic,
  updateTopic,
  archiveTopic,
  SubjectDto,
  TopicDto,
} from '../../api/subjectApi';
import {
  ChevronRight,
  Layers,
  Plus,
  Edit3,
  Archive,
  BookOpen,
  X,
  AlertCircle,
  PlayCircle,
} from 'lucide-react';

export function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const { token } = useAuth();

  const [subject, setSubject] = useState<SubjectDto | null>(null);
  const [topics, setTopics] = useState<TopicDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [includeArchived, setIncludeArchived] = useState(false);

  // Modal States for Topic
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<TopicDto | null>(null);
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSubjectAndTopics = useCallback(async () => {
    if (!token || !subjectId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [subjData, topicsData] = await Promise.all([
        fetchSubject(token, subjectId),
        fetchTopicsBySubject(token, subjectId, includeArchived),
      ]);
      setSubject(subjData);
      setTopics(topicsData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load subject details');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, subjectId, includeArchived]);

  useEffect(() => {
    loadSubjectAndTopics();
  }, [loadSubjectAndTopics]);

  const handleOpenCreateTopic = () => {
    setEditingTopic(null);
    setTopicName('');
    setTopicDesc('');
    setModalError(null);
    setIsTopicModalOpen(true);
  };

  const handleOpenEditTopic = (topic: TopicDto, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingTopic(topic);
    setTopicName(topic.name);
    setTopicDesc(topic.description || '');
    setModalError(null);
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !subjectId) return;
    setModalError(null);
    setIsSubmitting(true);

    try {
      if (editingTopic) {
        await updateTopic(token, editingTopic.id, {
          name: topicName,
          description: topicDesc,
        });
      } else {
        await createTopic(token, subjectId, {
          name: topicName,
          description: topicDesc,
        });
      }
      setIsTopicModalOpen(false);
      await loadSubjectAndTopics();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError('Failed to save topic');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveTopic = async (topicId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    if (!confirm('Are you sure you want to archive this topic?')) return;

    try {
      await archiveTopic(token, topicId);
      await loadSubjectAndTopics();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
        <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error || 'Subject not found'}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-sm text-slate-500">
        <Link to="/app/subjects" className="hover:text-slate-900 flex items-center space-x-1">
          <Layers className="w-4 h-4" />
          <span>Subjects</span>
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-semibold text-slate-900">{subject.name}</span>
      </nav>

      {/* Header Info Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{subject.name}</h1>
          <p className="text-slate-600 text-sm">{subject.description || 'No description provided.'}</p>
        </div>

        <button
          onClick={handleOpenCreateTopic}
          className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2.5 rounded-lg text-sm shadow-sm transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Topic</span>
        </button>
      </div>

      {/* Topics List Header & Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Topics in {subject.name}</h2>
        <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>Show archived topics</span>
        </label>
      </div>

      {topics.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No topics under this subject</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Break down {subject.name} into specific topics (e.g. Percentages, Triangles) to start recording study sessions.
          </p>
          <button
            onClick={handleOpenCreateTopic}
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Topic</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              to={`/app/topics/${topic.id}`}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {topic.name}
                  </h3>
                  {topic.archived && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-medium">
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4">
                  {topic.description || 'No topic notes/description.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span className="inline-flex items-center space-x-1 text-sky-600 font-medium">
                  <PlayCircle className="w-4 h-4" />
                  <span>View Details &amp; Log Study</span>
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => handleOpenEditTopic(topic, e)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded hover:bg-slate-100"
                    title="Edit Topic"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {!topic.archived && (
                    <button
                      onClick={(e) => handleArchiveTopic(topic.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                      title="Archive Topic"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Dialog for Create/Edit Topic */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsTopicModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingTopic ? 'Edit Topic' : 'Add New Topic'}
            </h2>

            {modalError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveTopic} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  required
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="e.g. Quadratic Equations"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  placeholder="Notes or key formulas..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingTopic ? 'Update Topic' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
