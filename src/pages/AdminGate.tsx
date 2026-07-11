import { useAuth } from '../lib/useAuth';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function AdminGate() {
  const { isAuthed, loading } = useAuth();
  if (loading) return <div className="admin-loading">Chargement…</div>;
  return isAuthed ? <AdminDashboard /> : <AdminLogin />;
}
