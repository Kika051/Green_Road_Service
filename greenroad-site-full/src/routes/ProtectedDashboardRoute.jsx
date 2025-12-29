import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks';

const ProtectedDashboardRoute = ({ children }) => {
  const { loading, canAccessDashboard } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    );
  }

  if (!canAccessDashboard) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedDashboardRoute;
