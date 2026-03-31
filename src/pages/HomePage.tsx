import {useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'motion/react';
import {BookOpen, ChevronRight} from 'lucide-react';
import {publishedArticles} from '../lib/articles';
import {cn} from '../lib/utils';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    publishedArticles.forEach((article) => article.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  const filteredArticles = useMemo(
    () =>
      publishedArticles.filter((article) => {
        const matchesSearch =
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTag = !selectedTag || article.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
      }),
    [searchQuery, selectedTag],
  );

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="text-center py-12">
        <motion.h1 initial={{opacity: 0, scale: 0.9}} animate={{opacity: 1, scale: 1}} className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Doc</span> Port
        </motion.h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
          HTMLファイルを追加するだけで、ページを自動で整理・公開。
          DocPort がチーム共有しやすい形にまとめます。
        </p>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
              <BookOpen size={20} />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-navy-900 border border-navy-800 text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border',
                !selectedTag
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-navy-900 border-navy-800 text-slate-400 hover:border-slate-700',
              )}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border',
                  selectedTag === tag
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-navy-900 border-navy-800 text-slate-400 hover:border-slate-700',
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
            <motion.div key={article.id} initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: index * 0.05}}>
              <Link
                to={`/article/${article.slug}`}
                className="group block h-full bg-navy-900 border border-navy-800 rounded-3xl p-8 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">{article.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-400 transition-colors line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-3 mb-8">{article.summary}</p>
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
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
            className="mt-4 text-indigo-400 hover:underline font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
