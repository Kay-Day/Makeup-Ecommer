import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { assetUrl, blogApi, type BlogArticle } from '../services/api';
import { richTextToPlainText, sanitizeRichTextHtml } from '../utils/richText';
import { absoluteUrl, plainTextFromHtml, setSeo } from '../utils/seo';

function articleUrl(article: BlogArticle) {
  return `/blog/${article.public_slug || article.slug || article.id}`;
}

export function ArticlePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [related, setRelated] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        if (!id) return;
        const articleResponse = /^\d+$/.test(id)
          ? await blogApi.getArticle(Number(id))
          : await blogApi.getArticleBySlug(id);
        setArticle(articleResponse.data);
        const canonicalArticlePath = articleUrl(articleResponse.data);
        if (`/blog/${id}` !== canonicalArticlePath) {
          navigate(canonicalArticlePath, { replace: true });
        }

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
  }, [id, navigate]);

  useEffect(() => {
    if (!article) return;

    const description = article.seo_description?.trim() || plainTextFromHtml(article.content, 158) || article.title;
    const seoTitle = article.seo_title?.trim() || `${article.title} | TMC Beauty`;
    const canonicalPath = article.canonical_url?.trim() || articleUrl(article);
    const image = assetUrl(article.og_image_url || article.image_url || '/logo.png');
    const keywords = article.focus_keyword?.trim() || undefined;
    const publishedAt = article.created_at ? new Date(article.created_at).toISOString() : undefined;
    const modifiedAt = article.updated_at ? new Date(article.updated_at).toISOString() : publishedAt;

    setSeo({
      title: seoTitle,
      description,
      canonical: canonicalPath,
      image,
      keywords,
      type: 'article',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.seo_title?.trim() || article.title,
          description,
          keywords,
          image: [absoluteUrl(image)],
          datePublished: publishedAt,
          dateModified: modifiedAt,
          author: {
            '@type': 'Person',
            name: article.author?.full_name || article.author?.email || 'TMC Beauty',
          },
          publisher: {
            '@type': 'Organization',
            name: 'TMC Beauty',
            logo: {
              '@type': 'ImageObject',
              url: `${window.location.origin}/logo.png`,
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': absoluteUrl(canonicalPath),
          },
          articleSection: article.category?.name,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Trang chủ',
              item: `${window.location.origin}/`,
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Blog',
              item: `${window.location.origin}/blog`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: article.title,
              item: absoluteUrl(canonicalPath),
            },
          ],
        },
      ],
    });
  }, [article]);

  if (loading) {
    return <div className="py-20 text-center text-stone-500">{t('article.loading')}</div>;
  }

  if (!article) {
    return <div className="py-20 text-center text-stone-500">{t('article.not_found')}</div>;
  }

  return (
    <div className="bg-stone-50 pb-20">
      <header className="relative h-[420px] overflow-hidden">
        <img className="h-full w-full object-cover" src={assetUrl(article.image_url || '')} alt={article.title} />
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
          <div
            className="mt-8 text-lg leading-8 text-stone-700 [&_a]:font-semibold [&_a]:text-emerald-800 [&_a:hover]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-emerald-700 [&_blockquote]:pl-5 [&_blockquote]:text-stone-600 [&_h2]:mb-4 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-stone-950 [&_h3]:mb-3 [&_h3]:mt-7 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-stone-950 [&_img]:my-8 [&_img]:max-h-[620px] [&_img]:w-full [&_img]:rounded-2xl [&_img]:object-contain [&_li]:my-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_strong]:font-bold [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(article.content) }}
          />
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
                <Link key={item.id} to={articleUrl(item)} className="block rounded-2xl border border-stone-100 p-3 transition hover:bg-stone-50">
                  <p className="font-semibold text-stone-900">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-stone-600">{richTextToPlainText(item.content, 110)}</p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
