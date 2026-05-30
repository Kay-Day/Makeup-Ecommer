type MetaAttributes = Record<string, string>;

function upsertMeta(selector: string, attributes: MetaAttributes) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

function upsertLink(selector: string, attributes: MetaAttributes) {
  let element = document.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

export function plainTextFromHtml(value: string, maxLength = 160) {
  const text = value
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export function absoluteUrl(pathOrUrl: string | null | undefined) {
  if (!pathOrUrl) return window.location.origin;
  try {
    return new URL(pathOrUrl, window.location.origin).href;
  } catch {
    return window.location.origin;
  }
}

export function setSeo({
  title,
  description,
  canonical,
  image,
  keywords,
  type = 'website',
  robots = 'index,follow',
  jsonLd,
}: {
  title: string;
  description: string;
  canonical: string;
  image?: string | null;
  keywords?: string | null;
  type?: string;
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}) {
  const canonicalUrl = absoluteUrl(canonical);
  const imageUrl = image ? absoluteUrl(image) : `${window.location.origin}/logo.png`;

  document.title = title;
  upsertMeta('meta[name="description"]', { name: 'description', content: description });
  upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords || '' });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl });
  upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
  upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

  const existingJsonLd = document.getElementById('page-jsonld');
  if (existingJsonLd) existingJsonLd.remove();
  if (jsonLd) {
    const script = document.createElement('script');
    script.id = 'page-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}
