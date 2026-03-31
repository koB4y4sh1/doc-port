import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {LoadingScreen} from '../lib/authUi';
import {supabase} from '../lib/supabase';

export default function SignOutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const execute = async () => {
      await supabase.auth.signOut();
      navigate('/sign-in', {replace: true});
    };

    void execute();
  }, [navigate]);

  return <LoadingScreen />;
}
