import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AllNotesPage } from './pages/AllNotesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { NotesPage } from './pages/NotesPage';
import { PostsPage } from './pages/PostsPage';
import { UsersPage } from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route element={<ProtectedRoute admin />}>
            <Route path="/users" element={<UsersPage />} />
            <Route path="/admin/notes" element={<AllNotesPage />} />
            <Route path="/admin/analytics/users-by-interest" element={<AnalyticsPage />} />
            <Route path="/analytics" element={<Navigate to="/admin/analytics/users-by-interest" replace />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Routes>
  );
}
