import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { fetchTopic, updateTopic, TopicDto } from '../../api/subjectApi';
import {
  ChevronRight,
  Layers,
  Edit3,
  BookOpen,
  PlusCircle,
  AlertCircle,
  X,
  History,
} from 'lucide-react';

export function TopicDetailPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const { token } = useAuth();

  const [topic, setTopic] = useState<TopicDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTopic = useCallback(async () => {
    if (!token || !topicId) return;
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTopic(token, topicId);
      setTopic(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load topic details');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, topicId]);

  useEffect(() => {
    loadTopic();
  }, [loadTopic]);

  const handleOpenEdit = () => {
    if (!topic) return;
    setNameInput(topic.name);
    setDescInput(topic.description || '');
    setModalError(null);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !topicId) return;
    setModalError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateTopic(token, topicId, {
        name: nameInput,
        description: descInput,
      });
      setTopic(updated);
      setIsEditOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError('Failed to update topic');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse" />;
  }

  if (error || !topic) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{error || 'Topic not found'}</span>
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
        <Link to={`/app/subjects/${topic.subjectId}`} className="hover:text-slate-900">
          {topic.subjectName}
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="font-semibold text-slate-900">{topic.name}</span>
      </nav>

      {/* Main Topic Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">{topic.name}</h1>
            {topic.archived && (
              <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded font-semibold">
                Archived
              </span>
            )}
          </div>
          <p className="text-slate-600 text-sm">{topic.description || 'No topic notes/description.'}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center space-x-2 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Edit Topic</span>
          </button>

          <Link
            to={`/app/sessions/new?topicId=${topic.id}`}
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Study Session</span>
          </Link>
        </div>
      </div>

      {/* Study Session History Placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center space-x-2 text-slate-900 font-bold mb-4">
          <History className="w-5 h-5 text-sky-600" />
          <h2 className="text-lg">Study Sessions &amp; Revision History</h2>
        </div>

        <div className="text-center py-8">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No study sessions recorded yet for {topic.name}</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Click "Log Study Session" to record your study time and trigger automatic revision tasks.
          </p>
        </div>
      </div>

      {/* Modal Dialog for Edit Topic */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Topic</h2>

            {modalError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Topic Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Update Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
