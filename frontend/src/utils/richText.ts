import { assetUrl } from '../services/api';

const ALLOWED_TAGS = new Set([
  'A',
  'B',
  'BLOCKQUOTE',
  'BR',
  'EM',
  'FIGCAPTION',
  'FIGURE',
  'H2',
  'H3',
  'H4',
  'HR',
  'I',
  'IMG',
  'LI',
  'OL',
  'P',
  'SPAN',
  'STRONG',
  'U',
  'UL',
]);

const ALLOWED_ATTRIBUTES = new Set(['alt', 'href', 'src', 'target', 'title', 'rel']);

function isSafeUrl(value: string) {
  if (!value) return false;
  if (value.startsWith('/') || value.startsWith('#')) return true;
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function cleanNode(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) return;
  if (node.nodeType !== Node.ELEMENT_NODE) {
    node.parentNode?.removeChild(node);
    return;
  }

  const element = node as HTMLElement;
  if (!ALLOWED_TAGS.has(element.tagName)) {
    const fragment = document.createDocumentFragment();
    while (element.firstChild) fragment.appendChild(element.firstChild);
    element.replaceWith(fragment);
    Array.from(fragment.childNodes).forEach(cleanNode);
    return;
  }

  Array.from(element.attributes).forEach((attribute) => {
    const name = attribute.name.toLowerCase();
    if (name.startsWith('on') || !ALLOWED_ATTRIBUTES.has(name)) {
      element.removeAttribute(attribute.name);
    }
  });

  if (element.tagName === 'A') {
    const href = element.getAttribute('href') || '';
    if (!isSafeUrl(href)) {
      element.removeAttribute('href');
    } else {
      element.setAttribute('rel', 'noopener noreferrer');
      if (!href.startsWith('/') && !href.startsWith('#')) element.setAttribute('target', '_blank');
    }
  }

  if (element.tagName === 'IMG') {
    const src = element.getAttribute('src') || '';
    if (!isSafeUrl(src)) {
      element.remove();
      return;
    }
    element.setAttribute('src', assetUrl(src));
    element.setAttribute('loading', 'lazy');
    element.setAttribute('decoding', 'async');
    if (!element.getAttribute('alt')) element.setAttribute('alt', '');
  }

  Array.from(element.childNodes).forEach(cleanNode);
}

export function sanitizeRichTextHtml(value: string | null | undefined) {
  if (!value) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  Array.from(doc.body.childNodes).forEach(cleanNode);
  doc.body.querySelectorAll('p').forEach((paragraph) => {
    if (!paragraph.textContent?.trim() && paragraph.children.length === 0) paragraph.remove();
  });
  return doc.body.innerHTML;
}

export function richTextToPlainText(value: string | null | undefined, maxLength = 160) {
  if (!value) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(value, 'text/html');
  const text = doc.body.textContent?.replace(/\s+/g, ' ').trim() || '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}
