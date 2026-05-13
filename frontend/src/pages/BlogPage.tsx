import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogApi, type BlogArticle, type BlogCategory } from '../services/api';

export function BlogPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [categoriesResponse, articlesResponse] = await Promise.all([
          blogApi.getCategories(),
          blogApi.getArticles(activeCategory ? { category_id: activeCategory } : undefined),
        ]);
        setCategories(categoriesResponse.data);
        setArticles(articlesResponse.data);
      } catch (error) {
        console.error('Failed to load blog data', error);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [activeCategory]);

  const featured = articles[0];
  const remaining = articles.slice(1);

  return (
    <div className="px-6 pb-24 pt-20 md:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl py-12">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-700">{t('article.blog_label')}</p>
          <h1 className="mt-4 text-4xl font-bold text-stone-900 md:text-5xl">{t('article.blog_title')}</h1>
          <p className="mt-5 text-lg text-stone-600">{t('article.blog_desc')}</p>
        </header>

        <div className="mb-10 flex flex-wrap gap-3">
          <button
            className={`rounded-full px-5 py-2 text-sm font-semibold ${activeCategory === null ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-700'}`}
            onClick={() => setActiveCategory(null)}
          >
            {t('article.all')}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${activeCategory === category.id ? 'bg-emerald-900 text-white' : 'bg-stone-100 text-stone-700'}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? <div className="py-20 text-center text-stone-500">{t('article.loading')}</div> : null}

        {!loading && featured ? (
          <Link to={`/blog/${featured.id}`} className="mb-16 grid overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm lg:grid-cols-2">
            <img className="h-full min-h-80 w-full object-cover" src={featured.image_url || ''} alt={featured.title} />
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-700">{featured.category?.name || t('article.featured')}</p>
              <h2 className="mt-4 text-3xl font-bold text-stone-900">{featured.title}</h2>
              <p className="mt-4 line-clamp-4 text-stone-600">{featured.content}</p>
              <div className="mt-8 text-sm font-semibold text-emerald-800">
                {featured.author?.full_name || featured.author?.email} - {featured.created_at ? new Date(featured.created_at).toLocaleDateString('vi-VN') : ''}
              </div>
            </div>
          </Link>
        ) : null}

        {!loading ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {remaining.map((article) => (
              <Link key={article.id} to={`/blog/${article.id}`} className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1">
                <img className="aspect-[4/3] w-full object-cover" src={article.image_url || ''} alt={article.title} />
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">{article.category?.name}</p>
                  <h3 className="mt-3 text-xl font-bold text-stone-900">{article.title}</h3>
                  <p className="mt-3 line-clamp-3 text-stone-600">{article.content}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
