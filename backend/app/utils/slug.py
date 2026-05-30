import re
import unicodedata


def normalize_slug(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value or "")
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def looks_like_broken_vietnamese_slug(value: str | None) -> bool:
    if not value:
        return False
    parts = [part for part in value.split("-") if part]
    if len(parts) < 6:
        return False
    single_char_parts = sum(1 for part in parts if len(part) == 1)
    return single_char_parts / len(parts) >= 0.35


def public_article_slug(title: str, slug: str | None) -> str:
    if slug and not looks_like_broken_vietnamese_slug(slug):
        return slug
    return normalize_slug(title) or slug or ""
