import { useEffect, useState } from 'react';
import { fetchHealthStatus } from '../api/http';
import { BookOpen, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export function App() {
  const [health, setHealth] = useState<string>('Checking...');

  useEffect(() => {
    fetchHealthStatus()
      .then((data) => setHealth(data.status))
      .catch(() => setHealth('DOWN'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-sky-600 p-2 rounded-lg text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">ReviseMind</span>
          </div>
          <div className="flex items-center space-x-2 text-sm font-medium">
            <span className="text-slate-500">Backend Health:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                health === 'UP'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {health}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 flex-1 w-full flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          <span>Milestone 1 Foundation Scaffold</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Master Any Subject with Active Recall
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mb-10 leading-relaxed">
          Log study sessions and automatically receive spaced repetition revision tasks at 0, 3, 7, 14, and 21 day intervals.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full text-left">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-sky-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Spaced Repetition</h3>
            <p className="text-sm text-slate-600">Automated task queue tuned for optimal cognitive retention.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <BookOpen className="w-8 h-8 text-sky-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Active Recall Flow</h3>
            <p className="text-sm text-slate-600">Prompt recall before revealing study notes and recording outcomes.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-sky-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Private & Isolated</h3>
            <p className="text-sm text-slate-600">Scoped database security ensuring your notes stay private.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          ReviseMind &copy; {new Date().getFullYear()} &mdash; Spaced Repetition &amp; Active Recall System
        </div>
      </footer>
    </div>
  );
}
