/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ChevronRight, BookOpen, Clock, List } from 'lucide-react';
import { cn } from './lib/utils';

// --- Dynamic Article Loading ---

// Scan src/pages directory for .html files at build time
const rawArticles = (import.meta as any).glob('./pages/*.html', { as: 'raw', eager: true });

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  date: string;
  tags: string[];
  styles: string;
  conclusion?: string;
}

const parseArticles = (): Article[] => {
  return Object.entries(rawArticles).map(([path, content], index) => {
    const slug = path.split('/').pop()?.replace('.html', '') || `article-${index}`;
    const parser = new DOMParser();
    const doc = parser.parseFromString(content as string, 'text/html');
    
    // Extract styles
    const styleTags = doc.querySelectorAll('style');
    let styles = '';
    styleTags.forEach(tag => {
      styles += tag.textContent + '\n';
      tag.remove();
    });

    // Extract title from <title> tag (User Request)
    const title = doc.title || doc.querySelector('h1')?.textContent || slug;
    
    // Extract summary for preview (Home page cards) - DO NOT REMOVE from doc
    const summary = doc.querySelector('p')?.textContent || '';

    // Metadata Extraction
    const metaKeywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content');
    const metaDate = doc.querySelector('meta[name="date"]')?.getAttribute('content');
    const divMetadata = doc.querySelector('.article-metadata');

    const tags = (metaKeywords || divMetadata?.getAttribute('data-tags'))
      ?.split(',')
      .map(t => t.trim())
      .filter(t => t !== "") || [];
    
    const date = metaDate || divMetadata?.getAttribute('data-date') || '2026-03-25';

    // Cleanup: Only remove metadata div, keep everything else for rendering
    if (divMetadata) divMetadata.remove();

    return {
      id: String(index + 1),
      title,
      slug,
      content: doc.body.innerHTML,
      summary,
      date,
      tags,
      styles,
    };
  });
};

const articles = parseArticles();

// --- Components ---

const GitHubIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg 
    role="img" 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.82 1.102.82 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
);

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();

  return (
    <>
      {/* Overlay - Active on all sizes now */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 bottom-0 w-80 bg-navy-900 border-r border-navy-800 z-50 shadow-2xl shadow-black/50"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-navy-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl" onClick={onClose}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen size={18} />
              </div>
              <span>DocPort</span>
            </Link>
            <button 
              onClick={onClose} 
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-all flex items-center gap-2 group"
              aria-label="Close menu"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Close</span>
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pages
            </div>
            {articles.map((article) => {
              const isActive = location.pathname === `/article/${article.slug}`;
              return (
                <Link
                  key={article.id}
                  to={`/article/${article.slug}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                      : "text-slate-400 hover:bg-navy-800 hover:text-slate-200"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    isActive ? "bg-indigo-400" : "bg-transparent group-hover:bg-slate-600"
                  )} />
                  <span className="text-sm font-medium line-clamp-1">{article.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-navy-800">
            <div className="bg-navy-800 rounded-2xl p-4">
              <p className="text-xs text-slate-500 mb-1">Status</p>
              <p className="text-sm text-slate-300 font-medium">Auto-Scan Active</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

const TableOfContents = ({ content, onClose }: { content: string; onClose?: () => void }) => {
  const headings = useMemo(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');
    return Array.from(headingElements).map((el, index) => ({
      id: `heading-${index}`,
      text: el.textContent,
      level: el.tagName.toLowerCase(),
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
        {onClose && (
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        )}
      </div>
      
      <nav className="space-y-4">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={onClose}
            className={cn(
              "block text-sm transition-all duration-200 hover:text-indigo-400 border-l-2 py-1",
              heading.level === 'h2' 
                ? "text-slate-200 font-medium pl-4 border-navy-700 hover:border-indigo-500" 
                : "text-slate-500 pl-8 border-navy-800 hover:border-indigo-500/50"
            )}
          >
            {heading.text}
          </a>
        ))}
      </nav>
      
      <div className="pt-6 border-t border-navy-800">
        <button 
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            onClose?.();
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 text-xs font-bold transition-colors w-full"
        >
          <ChevronRight size={14} className="-rotate-90" />
          Back to top
        </button>
      </div>
    </div>
  );
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20, x: '-50%' }}
          animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, scale: 0.5, y: 20, x: '-50%' }}
          whileHover={{ scale: 1.1, x: '-50%' }}
          whileTap={{ scale: 0.9, x: '-50%' }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="fixed bottom-8 left-1/2 z-40 w-12 h-12 bg-navy-800/90 backdrop-blur-md text-indigo-400 rounded-full shadow-2xl border border-navy-700 flex items-center justify-center hover:bg-navy-700 hover:text-white transition-all duration-300"
        >
          <ChevronRight size={24} className="-rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const ArticlePage = () => {
  const { slug } = useParams();
  const article = articles.find((a) => a.slug === slug);
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Inject IDs into headings for TOC linking
  const processedContent = useMemo(() => {
    if (!article) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.content, 'text/html');
    const headingElements = doc.querySelectorAll('h2, h3');
    headingElements.forEach((el, index) => {
      el.id = `heading-${index}`;
    });
    return doc.body.innerHTML;
  }, [article]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} | DocPort`;
    }
    return () => {
      document.title = 'DocPort';
    };
  }, [article]);

  // Inject custom styles if present
  useEffect(() => {
    if (article?.styles) {
      const styleTag = document.createElement('style');
      const scopeClass = `.article-id-${article.id}`;
      styleTag.id = `article-styles-${article.id}`;
      
      let scopedCss = article.styles
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector) => {
          const trimmedSelector = selector.trim();
          if (trimmedSelector.startsWith('@') || trimmedSelector.startsWith(':root')) {
            return match;
          }
          
          const scopedSelector = selector
            .split(',')
            .map((s) => {
              const part = s.trim();
              if (!part) return s;
              if (part === 'body' || part === 'html') return scopeClass;
              return `${scopeClass} ${part}`;
            })
            .join(', ');
          
          return `${scopedSelector}${match.endsWith(',') ? ',' : ' {'}`;
        })
        .replace(/:root/g, scopeClass);
      
      styleTag.textContent = scopedCss;
      document.head.appendChild(styleTag);
      
      return () => {
        const tag = document.getElementById(`article-styles-${article.id}`);
        if (tag) tag.remove();
      };
    }
  }, [article]);

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <Link to="/" className="text-indigo-400 hover:underline">Go back home</Link>
      </div>
    );
  }

  const hasCustomStyles = !!article.styles;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={article.id}
      className={cn("mx-auto", hasCustomStyles ? "max-w-[1100px]" : "max-w-4xl")}
    >
      {/* Minimal Metadata Bar */}
      <div className="flex flex-wrap items-center gap-6 mb-8 px-4 lg:px-0">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
          <Clock size={14} className="text-indigo-500" />
          <span>{article.date}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {article.tags.map(tag => (
            <span key={tag} className="text-indigo-400/70 text-[10px] font-black uppercase tracking-[0.2em]">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <div 
          className={cn(
            `article-id-${article.id} article-render-area w-full px-4 lg:px-0`,
            !hasCustomStyles && "prose prose-invert prose-headings:text-white prose-p:text-slate-400 prose-strong:text-indigo-400 prose-a:text-indigo-400 max-w-none"
          )}
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>

      {/* Floating Buttons */}
      <ScrollToTop />
      <div className="fixed top-24 right-8 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsTocOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-navy-800/90 backdrop-blur-md text-indigo-400 rounded-full shadow-xl border border-navy-700 hover:bg-navy-700 hover:text-white transition-all duration-300"
        >
          <List size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">Contents</span>
        </motion.button>
      </div>

      {/* TOC Drawer Overlay */}
      <AnimatePresence>
        {isTocOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTocOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-navy-900 border-l border-navy-800 z-50 shadow-2xl p-8 overflow-y-auto"
            >
              <TableOfContents content={article.content} onClose={() => setIsTocOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach(a => a.tags.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, []);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = !selectedTag || article.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag]);

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center py-12">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Doc</span> Port
        </motion.h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          HTMLファイルを追加するだけで、ページを自動で整理・公開。
          DocPort がチーム共有しやすい形にまとめます。
        </p>

        {/* Search and Filter UI */}
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <BookOpen size={20} />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900 border border-navy-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                !selectedTag 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                  : "bg-navy-900 border-navy-800 text-slate-400 hover:border-slate-700"
              )}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border",
                  selectedTag === tag
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-navy-900 border-navy-800 text-slate-400 hover:border-slate-700"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                to={`/article/${article.slug}`}
                className="group block h-full bg-navy-900 border border-navy-800 rounded-3xl p-8 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">#{tag}</span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{article.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-3 mb-8">
                  {article.summary}
                </p>
                <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold group-hover:gap-4 transition-all">
                  View Page <ChevronRight size={16} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">No articles found matching your criteria.</p>
          <button 
            onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
            className="mt-4 text-indigo-400 hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-navy-950 flex flex-col">
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-md border-b border-navy-800/50">
          <div className="w-full px-6 h-20 flex items-center justify-between">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group"
            >
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

            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/koB4y4sh1/doc-port" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-4 py-2 bg-navy-900 border border-navy-800 rounded-full text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all group shadow-lg shadow-black/20"
              >
                <GitHubIcon size={16} className="group-hover:text-indigo-400 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">GitHub</span>
              </a>
            </div>
          </div>
        </header>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        {/* Main Content Area */}
        <main className="flex-1 flex justify-center p-6 lg:p-12 overflow-y-auto">
          <div className="w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-12 border-t border-navy-800/50 text-center space-y-4">
          <p className="text-slate-500 text-sm">&copy; 2026 DocPort. Built for modern documentation.</p>
          <div className="flex justify-center gap-6">
            <a 
              href="https://github.com/koB4y4sh1/doc-port" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-600 hover:text-indigo-400 transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <GitHubIcon size={16} />
              GitHub
            </a>
          </div>
          <p className="text-slate-600 text-xs uppercase tracking-widest">Created by koB4y4sh1</p>
        </footer>
      </div>
    </Router>
  );
}
