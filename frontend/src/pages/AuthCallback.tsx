import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import { GraduationCap } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      navigate(`/auth/error?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }

    if (token) {
      authService.storeToken(token);
      refreshUser().then(() => {
        navigate('/dashboard', { replace: true });
      });
    } else {
      navigate('/auth/error?error=No+token+received', { replace: true });
    }
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <GraduationCap className="h-9 w-9 text-white" />
        </div>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4" />
        <p className="text-slate-700 font-medium">Signing you in...</p>
        <p className="text-slate-500 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );
}
