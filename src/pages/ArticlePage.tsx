import {useEffect, useMemo, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {AnimatePresence, motion} from 'motion/react';
import {ChevronRight, Clock, List, X} from 'lucide-react';
import {articles} from '../lib/articles';
import {ARTICLE_ROOT_CLASS} from '../lib/articleSecurity';
import {cn} from '../lib/utils';

function TableOfContents({content, onClose}: {content: string; onClose?: () => void}) {
  const headings = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    return Array.from(doc.querySelectorAll('h2, h3')).map((element, index) => ({
      id: `heading-${index}`,
      text: element.textContent,
      level: element.tagName.toLowerCase(),
    }));
  }, [content]);

  if (headings.length === 0) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em]">
          <List size={14} />
          <span>On this page</span>
        </div>
        {onClose && <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors"><X size={20} /></button>}
      </div>
      <nav className="space-y-4">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={onClose}
            className={cn(
              'block text-sm transition-all duration-200 hover:text-indigo-400 border-l-2 py-1',
              heading.level === 'h2'
                ? 'text-slate-200 font-medium pl-4 border-navy-700 hover:border-indigo-500'
                : 'text-slate-500 pl-8 border-navy-800 hover:border-indigo-500/50',
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
    </div>
  );
}

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 400);
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{opacity: 0, scale: 0.5, y: 20, x: '-50%'}}
          animate={{opacity: 1, scale: 1, y: 0, x: '-50%'}}
          exit={{opacity: 0, scale: 0.5, y: 20, x: '-50%'}}
          whileHover={{scale: 1.1, x: '-50%'}}
          whileTap={{scale: 0.9, x: '-50%'}}
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          aria-label="Scroll to top"
          className="fixed bottom-8 left-1/2 z-40 w-12 h-12 bg-navy-800/90 backdrop-blur-md text-indigo-400 rounded-full shadow-2xl border border-navy-700 flex items-center justify-center hover:bg-navy-700 hover:text-white transition-all duration-300"
        >
          <ChevronRight size={24} className="-rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default function ArticlePage() {
  const {slug} = useParams();
  const article = articles.find((entry) => entry.slug === slug);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const processedContent = useMemo(() => {
    if (!article) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    doc.querySelectorAll('h2, h3').forEach((element, index) => {
      element.id = `heading-${index}`;
    });
    return doc.body.innerHTML;
  }, [article]);

  useEffect(() => {
    if (article) document.title = `${article.title} | DocPort`;
    return () => {
      document.title = 'DocPort';
    };
  }, [article]);

  useEffect(() => {
    if (!article?.styles || article.blocked) return;
    const styleTag = document.createElement('style');
    styleTag.id = `article-styles-${article.id}`;
    styleTag.textContent = article.styles;
    document.head.appendChild(styleTag);
    return () => document.getElementById(`article-styles-${article.id}`)?.remove();
  }, [article]);

  if (!article) {
    return <div className="flex flex-col items-center justify-center h-full text-slate-400"><h2 className="text-2xl font-bold mb-2">Page Not Found</h2><Link to="/" className="text-indigo-400 hover:underline">Go back home</Link></div>;
  }

  if (article.blocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
        <h2 className="text-2xl font-bold">Article Blocked</h2>
        <p className="text-sm text-slate-500 max-w-lg text-center">This article contains disallowed HTML or CSS and is not published.</p>
        <div className="w-full max-w-2xl bg-navy-900 border border-navy-800 rounded-2xl p-6">
          <ul className="space-y-2 text-xs text-rose-300">{article.validationErrors.map((error) => <li key={error}>{error}</li>)}</ul>
        </div>
      </div>
    );
  }

  const hasCustomStyles = article.styles.length > 0;

  return (
    <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} key={article.id} className={cn('mx-auto', hasCustomStyles ? 'max-w-[1100px]' : 'max-w-4xl')}>
      <div className="flex flex-wrap items-center gap-6 mb-8 px-4 lg:px-0">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <Clock size={14} className="text-indigo-500" />
          <span>{article.date}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {article.tags.map((tag) => <span key={tag} className="text-indigo-400/70 text-[10px] font-black uppercase tracking-[0.2em]">#{tag}</span>)}
        </div>
      </div>

      <div
        className={cn(
          `${ARTICLE_ROOT_CLASS} article-render-area w-full px-4 lg:px-0`,
          !hasCustomStyles &&
            'prose prose-invert prose-headings:text-white prose-p:text-slate-400 prose-strong:text-indigo-400 prose-a:text-indigo-400 max-w-none',
        )}
        dangerouslySetInnerHTML={{__html: processedContent}}
      />

      <ScrollToTop />
      <div className="fixed top-24 right-8 z-40">
        <motion.button whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} onClick={() => setIsTocOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-navy-800/90 backdrop-blur-md text-indigo-400 rounded-full shadow-xl border border-navy-700 hover:bg-navy-700 hover:text-white transition-all duration-300">
          <List size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Contents</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isTocOpen && (
          <>
            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={() => setIsTocOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <motion.div initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}} transition={{type: 'spring', damping: 25, stiffness: 200}} className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-navy-900 border-l border-navy-800 z-50 shadow-2xl p-8 overflow-y-auto">
              <TableOfContents content={article.content} onClose={() => setIsTocOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
