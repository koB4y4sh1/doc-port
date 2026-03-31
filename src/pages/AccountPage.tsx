import {FormEvent, useMemo, useState} from 'react';
import {useAuth} from '../contexts/AuthProvider';
import {supabase} from '../lib/supabase';

export default function AccountPage() {
  const {user} = useAuth();
  const [displayName, setDisplayName] = useState((user?.user_metadata?.display_name as string) || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const provider = useMemo(() => user?.app_metadata?.provider || 'email', [user]);

  const handleProfileUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSavingProfile(true);

    const {error: updateError} = await supabase.auth.updateUser({
      data: {
        display_name: displayName,
      },
    });

    setIsSavingProfile(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setMessage('プロフィールを更新しました。');
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setIsSavingPassword(true);

    const {error: updateError} = await supabase.auth.updateUser({
      password,
    });

    setIsSavingPassword(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPassword('');
    setMessage('パスワードを更新しました。');
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="rounded-3xl border border-navy-800 bg-navy-900/60 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Account</p>
        <h1 className="mt-4 text-3xl font-black text-white">アカウント設定</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">Supabase Auth で管理しているプロフィールと認証情報を編集します。</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-3xl border border-navy-800 bg-navy-900/70 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">Overview</p>
          <div className="mt-6 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Email</p>
              <p className="mt-2 text-sm text-slate-200 break-all">{user?.email ?? 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Provider</p>
              <p className="mt-2 text-sm text-slate-200">{provider}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">User ID</p>
              <p className="mt-2 text-sm text-slate-400 break-all">{user?.id}</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <form onSubmit={handleProfileUpdate} className="rounded-3xl border border-navy-800 bg-navy-900/70 p-6">
            <h2 className="text-xl font-bold text-white">プロフィール</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">サイドバーに表示するアカウント名を更新できます。</p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-medium text-slate-300">表示名</span>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-2xl border border-navy-700 bg-navy-950 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-500"
              />
            </label>
            <button type="submit" disabled={isSavingProfile} className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60">
              {isSavingProfile ? '保存中...' : 'プロフィールを保存'}
            </button>
          </form>

          <form onSubmit={handlePasswordUpdate} className="rounded-3xl border border-navy-800 bg-navy-900/70 p-6">
            <h2 className="text-xl font-bold text-white">パスワード</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">Supabase Auth に保存しているパスワードを更新します。</p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-medium text-slate-300">新しいパスワード</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                className="w-full rounded-2xl border border-navy-700 bg-navy-950 px-4 py-3 text-white outline-none transition-colors focus:border-indigo-500"
              />
            </label>
            <button type="submit" disabled={isSavingPassword} className="mt-5 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60">
              {isSavingPassword ? '更新中...' : 'パスワードを更新'}
            </button>
          </form>

          {(message || error) && (
            <div className={`rounded-2xl px-4 py-3 text-sm ${error ? 'border border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
              {error ?? message}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
