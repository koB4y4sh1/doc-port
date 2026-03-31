import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {AuthProvider} from './contexts/AuthProvider';
import './index.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const MissingSupabaseConfiguration = () => (
  <div className="min-h-screen bg-navy-950 text-slate-200 flex items-center justify-center p-6">
    <div className="w-full max-w-2xl rounded-3xl border border-rose-500/30 bg-navy-900 p-8 shadow-2xl shadow-black/30">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-300">Configuration Error</p>
      <h1 className="mt-4 text-3xl font-black text-white">Supabase configuration is missing.</h1>
      <p className="mt-4 text-sm leading-7 text-slate-300">
        Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code> in <code>.env.local</code> before starting the app.
      </p>
      <pre className="mt-6 overflow-x-auto rounded-2xl border border-navy-800 bg-navy-950 p-4 text-xs text-slate-400">
        VITE_SUPABASE_URL=https://your-project.supabase.co{'\n'}
        VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-publishable-key
      </pre>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {supabaseUrl && supabasePublishableKey ? (
      <AuthProvider>
        <App />
      </AuthProvider>
    ) : (
      <MissingSupabaseConfiguration />
    )}
  </StrictMode>,
);
