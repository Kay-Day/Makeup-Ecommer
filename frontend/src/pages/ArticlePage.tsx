import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogApi, type BlogArticle } from '../services/api';

export function ArticlePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [related, setRelated] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        if (!id) return;
        const articleResponse = await blogApi.getArticle(Number(id));
        setArticle(articleResponse.data);

        const relatedResponse = await blogApi.getArticles(
          articleResponse.data.category_id ? { category_id: articleResponse.data.category_id } : undefined,
        );
        setRelated(relatedResponse.data.filter((item) => item.id !== articleResponse.data.id).slice(0, 4));
      } catch (error) {
        console.error('Failed to load article', error);
      } finally {
        setLoading(false);
      }
    };

    void loadArticle();
  }, [id]);

  if (loading) {
    return <div className="py-20 text-center text-stone-500">{t('article.loading')}</div>;
  }

  if (!article) {
    return <div className="py-20 text-center text-stone-500">{t('article.not_found')}</div>;
  }

  return (
    <div className="bg-stone-50 pb-20">
      <header className="relative h-[420px] overflow-hidden">
        <img className="h-full w-full object-cover" src={article.image_url || ''} alt={article.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-6 pb-12 text-white md:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-200">{article.category?.name}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold md:text-5xl">{article.title}</h1>
          <p className="mt-4 text-sm text-white/85">
            {article.author?.full_name || article.author?.email} - {article.created_at ? new Date(article.created_at).toLocaleDateString('vi-VN') : ''}
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-6 pt-12 md:px-12 lg:grid-cols-[1fr,320px]">
        <article className="rounded-[2rem] bg-white p-8 shadow-sm">
          <Link to="/blog" className="text-sm font-semibold text-emerald-700">{t('article.back_to_blog')}</Link>
          <div className="mt-8 whitespace-pre-line text-lg leading-8 text-stone-700">{article.content}</div>
        </article>

        <aside className="space-y-5">
          <div className="rounded-[2rem] bg-emerald-950 p-6 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-200">{t('article.category_label')}</p>
            <h3 className="mt-3 text-2xl font-bold">{article.category?.name}</h3>
            <p className="mt-3 text-sm text-emerald-50/75">{article.category?.description}</p>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-bold text-stone-900">{t('article.related')}</h3>
            <div className="mt-4 space-y-4">
              {related.map((item) => (
                <Link key={item.id} to={`/blog/${item.id}`} className="block rounded-2xl border border-stone-100 p-3 transition hover:bg-stone-50">
                  <p className="font-semibold text-stone-900">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">{item.content}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
