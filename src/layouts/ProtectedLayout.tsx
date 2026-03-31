import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuth} from '../contexts/AuthProvider';
import {LoadingScreen} from '../lib/authUi';

export default function ProtectedLayout() {
  const {isLoading, user} = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to={`/sign-in?redirect=${encodeURIComponent(`${location.pathname}${location.search}${location.hash}`)}`} replace />;
  return <Outlet />;
}
