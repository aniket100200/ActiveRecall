import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  fetchSubjects,
  createSubject,
  updateSubject,
  archiveSubject,
  SubjectDto,
} from '../../api/subjectApi';
import { Layers, Plus, Search, Archive, Edit3, X, AlertCircle, BookOpen } from 'lucide-react';

export function SubjectsPage() {
  const { token } = useAuth();
  const [subjects, setSubjects] = useState<SubjectDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSubjects = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSubjects(token, includeArchived);
      setSubjects(data.content || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load subjects');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, includeArchived]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleOpenCreate = () => {
    setNameInput('');
    setDescInput('');
    setModalError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (subject: SubjectDto, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingSubject(subject);
    setNameInput(subject.name);
    setDescInput(subject.description || '');
    setModalError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setModalError(null);
    setIsSubmitting(true);

    try {
      if (editingSubject) {
        await updateSubject(token, editingSubject.id, {
          name: nameInput,
          description: descInput,
        });
        setEditingSubject(null);
      } else {
        await createSubject(token, { name: nameInput, description: descInput });
        setIsCreateOpen(false);
      }
      await loadSubjects();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setModalError(err.message);
      } else {
        setModalError('Failed to save subject');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (subjectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    if (!confirm('Are you sure you want to archive this subject?')) return;

    try {
      await archiveSubject(token, subjectId);
      await loadSubjects();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-7 h-7 text-sky-600" />
            <span>Subjects</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Organize your study areas and topics for active recall revision.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Subject</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
          />
        </div>

        <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
          />
          <span>Show archived subjects</span>
        </label>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 animate-pulse h-40" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No subjects found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            Get started by adding your first subject, such as Mathematics, Physics, or Biology.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Subject</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <Link
              key={subject.id}
              to={`/app/subjects/${subject.id}`}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-sky-600 transition-colors">
                    {subject.name}
                  </h3>
                  {subject.archived && (
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-medium">
                      Archived
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                  {subject.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-medium text-slate-500">
                <span className="bg-sky-50 text-sky-700 px-2.5 py-1 rounded-full font-semibold">
                  {subject.topicCount} {subject.topicCount === 1 ? 'Topic' : 'Topics'}
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => handleOpenEdit(subject, e)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded hover:bg-slate-100"
                    title="Edit Subject"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {!subject.archived && (
                    <button
                      onClick={(e) => handleArchive(subject.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                      title="Archive Subject"
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

      {/* Modal Dialog for Create / Edit Subject */}
      {(isCreateOpen || editingSubject) && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => {
                setIsCreateOpen(false);
                setEditingSubject(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingSubject ? 'Edit Subject' : 'Create New Subject'}
            </h2>

            {modalError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-sm flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Summary or scope of this subject..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setEditingSubject(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingSubject ? 'Update Subject' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
