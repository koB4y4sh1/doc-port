import React from 'react';
import {BookOpen} from 'lucide-react';
import {Link} from 'react-router-dom';

export const LoadingScreen = () => (
  <div className="min-h-screen bg-navy-950 flex items-center justify-center px-6">
    <div className="rounded-3xl border border-navy-800 bg-navy-900 px-8 py-10 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-400">Authentication</p>
      <h1 className="mt-4 text-2xl font-black text-white">セッションを確認しています...</h1>
    </div>
  </div>
);

export const AuthHeroLayout = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="min-h-screen bg-navy-950 text-slate-200 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.2),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.12),_transparent_25%)]" />
    <div className="relative min-h-screen grid gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(420px,560px)] lg:px-10">
      <section className="flex flex-col justify-between rounded-[2rem] border border-navy-800/80 bg-navy-900/70 p-8 backdrop-blur-xl lg:p-12">
        <div>
          <Link to="/" className="inline-flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/30">
              <BookOpen size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-300">DocPort</p>
              <p className="text-sm text-slate-400">認証付きドキュメントポータル</p>
            </div>
          </Link>

          <div className="mt-16 max-w-xl space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Supabase Auth</p>
            <h1 className="text-4xl font-black tracking-tight text-white lg:text-6xl">{title}</h1>
            <p className="max-w-lg text-base leading-8 text-slate-300">{description}</p>
          </div>

          <div className="mt-14 auth-brand-visual rounded-[2rem] border border-navy-800/80 bg-[linear-gradient(145deg,rgba(15,23,42,0.96),rgba(18,28,52,0.92))] p-8 overflow-hidden">
            <div className="auth-brand-orb auth-brand-orb-a" />
            <div className="auth-brand-orb auth-brand-orb-b" />
            <div className="auth-brand-grid" />

            <div className="relative grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-cyan-300">Portal layer</p>
                      <p className="mt-3 text-2xl font-black text-white">チームで共有できる知識ポータル</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                      <BookOpen size={24} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-black/10 p-5 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Article index</p>
                    <div className="mt-4 space-y-3">
                      <div className="h-3 w-24 rounded-full bg-slate-600/70" />
                      <div className="h-3 w-36 rounded-full bg-white/80" />
                      <div className="h-3 w-28 rounded-full bg-slate-500/70" />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-black/10 p-5 backdrop-blur-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Account layer</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-300 to-cyan-300" />
                      <div className="space-y-2">
                        <div className="h-3 w-24 rounded-full bg-white/80" />
                        <div className="h-3 w-16 rounded-full bg-slate-500/70" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-black/10 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-indigo-200">Session gate</p>
                  <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-navy-950/80 p-4">
                    <p className="text-sm font-bold text-white">サインイン</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">メールアドレスとパスワードでセッションを作成します。</p>
                  </div>
                  <div className="rounded-2xl border border-indigo-400/20 bg-indigo-400/10 p-4">
                    <p className="text-sm font-bold text-indigo-100">セッション発行</p>
                    <p className="mt-2 text-sm leading-6 text-indigo-100/70">Supabase が認証済みセッションを確認した後にだけページを開放します。</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <div className="h-3 w-full rounded-full bg-white/10" />
                    <div className="h-3 w-5/6 rounded-full bg-white/20" />
                    <div className="h-3 w-3/5 rounded-full bg-cyan-300/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center">{children}</section>
    </div>
  </div>
);
