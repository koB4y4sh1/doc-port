import {FormEvent, useState} from 'react';
import {Link, Navigate} from 'react-router-dom';
import {GitHubIcon} from '../components/GitHubIcon';
import {useAuth} from '../contexts/AuthProvider';
import {AuthHeroLayout, LoadingScreen} from '../lib/authUi';
import {supabase} from '../lib/supabase';

export default function SignUpPage() {
  const {isLoading, user} = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGitHubSubmitting, setIsGitHubSubmitting] = useState(false);

  if (isLoading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const {data, error: signUpError} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      setMessage('アカウントを作成し、そのままログインしました。');
      return;
    }

    setMessage('確認メールを送信しました。受信後に認証を完了してください。');
  };

  const handleGitHubSignIn = async () => {
    setError(null);
    setMessage(null);
    setIsGitHubSubmitting(true);

    const {error: oauthError} = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    setIsGitHubSubmitting(false);
    if (oauthError) {
      setError(oauthError.message);
    }
  };

  return (
    <AuthHeroLayout title="ようこそ、DocPortへ。" description="認証されたユーザーだけが入れる知識ポータルです。">
      <div className="w-full max-w-md rounded-[2rem] border border-navy-800 bg-navy-900/90 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Sign up</p>
        <h2 className="mt-4 text-3xl font-black text-white">サインアップ</h2>
        <p className="mt-3 text-sm leading-7 text-slate-400">メールアドレスで登録するか、GitHub アカウントで開始できます。</p>

        <button
          type="button"
          onClick={handleGitHubSignIn}
          disabled={isGitHubSubmitting}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-navy-700 bg-navy-950 px-4 py-3 text-sm font-bold text-slate-100 transition-colors hover:border-slate-500 hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GitHubIcon size={18} />
          {isGitHubSubmitting ? 'GitHub に接続中...' : 'GitHub で開始'}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-navy-800" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">or</span>
          <div className="h-px flex-1 bg-navy-800" />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">表示名</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              required
              className="w-full rounded-2xl border border-navy-700 bg-navy-950 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">メールアドレス</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-2xl border border-navy-700 bg-navy-950 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">パスワード</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              className="w-full rounded-2xl border border-navy-700 bg-navy-950 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-500"
            />
          </label>

          {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
          {message && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '作成中...' : 'メールでアカウントを作成'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400">
          すでにアカウントがある場合は <Link to="/sign-in" className="font-medium text-indigo-300 hover:text-indigo-200">サインイン</Link>
        </p>
      </div>
    </AuthHeroLayout>
  );
}
