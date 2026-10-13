import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { SubjectsPage } from '../features/subjects/SubjectsPage';
import { SubjectDetailPage } from '../features/subjects/SubjectDetailPage';
import { TopicDetailPage } from '../features/topics/TopicDetailPage';
import { NewStudySessionPage } from '../features/study-sessions/NewStudySessionPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { RevisionsPage } from '../features/revisions/RevisionsPage';
import { ActiveRecallPage } from '../features/revisions/ActiveRecallPage';
import { HistoryPage } from '../features/history/HistoryPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'revisions',
        element: <RevisionsPage />,
      },
      {
        path: 'revisions/:taskId',
        element: <ActiveRecallPage />,
      },
      {
        path: 'subjects',
        element: <SubjectsPage />,
      },
      {
        path: 'subjects/:subjectId',
        element: <SubjectDetailPage />,
      },
      {
        path: 'topics/:topicId',
        element: <TopicDetailPage />,
      },
      {
        path: 'sessions/new',
        element: <NewStudySessionPage />,
      },
      {
        path: 'history',
        element: <HistoryPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="dashboard" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/app/dashboard" replace />,
  },
]);
