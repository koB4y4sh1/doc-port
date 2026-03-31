import {AnimatePresence, motion} from 'motion/react';
import {BookOpen, LogOut, Menu, Settings, UserRound, X} from 'lucide-react';
import {useMemo, useRef, useState} from 'react';
import {Link, Outlet, useLocation} from 'react-router-dom';
import {GitHubIcon} from '../components/GitHubIcon';
import {useAuth} from '../contexts/AuthProvider';
import {publishedArticles} from '../lib/articles';
import {cn} from '../lib/utils';

function AccountMenu({onNavigate}: {onNavigate: () => void}) {
  const {user} = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accountName = useMemo(
    () => (user?.user_metadata?.display_name as string) || user?.email?.split('@')[0] || 'Account',
    [user],
  );
  const avatarUrl = useMemo(() => (user?.user_metadata?.avatar_url as string | undefined) || null, [user]);
  const initials = accountName.slice(0, 1).toUpperCase();

  const openMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsOpen(true);
  };

  const closeMenu = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      closeTimerRef.current = null;
    }, 180);
  };

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <div className="flex items-center gap-3 rounded-2xl border border-navy-800 bg-navy-950/70 p-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={accountName}
            className="h-11 w-11 rounded-2xl object-cover ring-1 ring-white/10"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-300 text-navy-950 font-black">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Account</p>
          <p className="mt-1 truncate text-sm font-medium text-slate-200">{accountName}</p>
        </div>
      </div>

      <div
        className={`absolute bottom-full left-0 mb-3 w-full transition-all duration-150 ${
          isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
        }`}
      >
        <div className="rounded-2xl border border-navy-800 bg-navy-900/95 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <Link
            to="/account"
            onClick={() => {
              setIsOpen(false);
              onNavigate();
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-navy-800 hover:text-white"
          >
            <Settings size={16} />
            Manage account
          </Link>
          <Link
            to="/sign-out"
            onClick={() => {
              setIsOpen(false);
              onNavigate();
            }}
            className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-navy-800 hover:text-white"
          >
            <LogOut size={16} />
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}

function Sidebar({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const location = useLocation();

  return (
    <>
      <AnimatePresence>
        {isOpen && <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer" />}
      </AnimatePresence>

      <motion.aside initial={{x: -320}} animate={{x: isOpen ? 0 : -320}} transition={{type: 'spring', damping: 25, stiffness: 200}} className="fixed top-0 left-0 bottom-0 w-80 bg-navy-900 border-r border-navy-800 z-50 shadow-2xl shadow-black/50">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-navy-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl" onClick={onClose}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><BookOpen size={18} /></div>
              <span>DocPort</span>
            </Link>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-all flex items-center gap-2 group" aria-label="Close menu">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pages</div>
            {publishedArticles.map((article) => {
              const isActive = location.pathname === `/article/${article.slug}`;
              return (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200',
                  )}
                >
                  <div className={cn('w-1.5 h-1.5 rounded-full transition-colors', isActive ? 'bg-indigo-400' : 'bg-transparent group-hover:bg-slate-600')} />
                  <span className="text-sm font-medium line-clamp-1">{article.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-navy-800 p-4">
            <AccountMenu onNavigate={onClose} />
          </div>
        </div>
      </motion.aside>
    </>
  );
}

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <header className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-md border-b border-navy-800/50">
        <div className="w-full px-6 h-20 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-all">
              <Menu size={20} />
            </div>
            <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">Menu</span>
          </button>

          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 text-white font-bold text-2xl tracking-tighter">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BookOpen size={20} />
            </div>
            <span>DocPort</span>
          </Link>

          <a href="https://github.com/koB4y4sh1/doc-port" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-2.5 px-4 py-2 bg-navy-900 border border-navy-800 rounded-full text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all group shadow-lg shadow-black/20">
            <GitHubIcon size={16} className="group-hover:text-indigo-400 transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">GitHub</span>
          </a>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="flex-1 flex justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      <footer className="py-12 border-t border-navy-800/50 text-center space-y-4">
        <p className="text-slate-500 text-sm">&copy; 2026 DocPort. Built for modern documentation.</p>
        <div className="flex justify-center gap-6">
          <a href="https://github.com/koB4y4sh1/doc-port" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-600 hover:text-indigo-400 transition-colors text-xs font-bold uppercase tracking-widest">
            <GitHubIcon size={16} />
            GitHub
          </a>
        </div>
        <p className="text-slate-600 text-xs uppercase tracking-widest">Created by koB4y4sh1</p>
      </footer>
    </div>
  );
}
