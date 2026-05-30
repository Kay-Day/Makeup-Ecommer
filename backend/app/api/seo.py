from datetime import datetime, timezone
from html import escape
import logging

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_db
from app.models.blog_article import BlogArticle
from app.models.blog_category import BlogCategory
from app.models.category import Category
from app.models.product import Product

router = APIRouter(tags=["SEO"])
logger = logging.getLogger(__name__)


def site_url() -> str:
    public_site_url = getattr(settings, "PUBLIC_SITE_URL", None)
    if public_site_url:
        return public_site_url.rstrip("/")
    return "https://giangtmc.io.vn"


def iso_date(value: datetime | None) -> str:
    if not value:
        return datetime.now(timezone.utc).date().isoformat()
    return value.date().isoformat()


def url_entry(loc: str, lastmod: str | None = None, changefreq: str = "weekly", priority: str = "0.7") -> str:
    lastmod_xml = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
    return (
        "<url>"
        f"<loc>{escape(loc)}</loc>"
        f"{lastmod_xml}"
        f"<changefreq>{changefreq}</changefreq>"
        f"<priority>{priority}</priority>"
        "</url>"
    )


def add_entries_safely(section: str, callback) -> None:
    try:
        callback()
    except SQLAlchemyError:
        logger.exception("Failed to build %s sitemap entries", section)


@router.get("/sitemap.xml", include_in_schema=False)
def sitemap(db: Session = Depends(get_db)):
    base = site_url()
    entries = [
        url_entry(f"{base}/", changefreq="daily", priority="1.0"),
        url_entry(f"{base}/shop", changefreq="daily", priority="0.9"),
        url_entry(f"{base}/blog", changefreq="daily", priority="0.9"),
        url_entry(f"{base}/contact", changefreq="monthly", priority="0.5"),
        url_entry(f"{base}/faq", changefreq="monthly", priority="0.5"),
    ]

    def add_categories():
        categories = db.query(Category.slug).order_by(Category.id.asc()).all()
        for (slug,) in categories:
            if slug:
                entries.append(url_entry(f"{base}/shop?category={slug}", changefreq="weekly", priority="0.7"))

    def add_products():
        products = (
            db.query(Product.id, Product.created_at)
            .filter(Product.is_active == True)
            .order_by(Product.id.asc())
            .all()
        )
        for product_id, created_at in products:
            entries.append(url_entry(f"{base}/product/{product_id}", lastmod=iso_date(created_at), changefreq="weekly", priority="0.8"))

    def add_blog_categories():
        blog_categories = db.query(BlogCategory.slug).order_by(BlogCategory.slug.asc()).all()
        for (slug,) in blog_categories:
            if slug:
                entries.append(url_entry(f"{base}/blog?category={slug}", changefreq="weekly", priority="0.7"))

    def add_articles():
        articles = (
            db.query(BlogArticle)
            .filter(BlogArticle.is_published == True)
            .order_by(BlogArticle.created_at.desc())
            .all()
        )
        for article in articles:
            if article.public_slug:
                entries.append(url_entry(f"{base}/blog/{article.public_slug}", lastmod=iso_date(article.created_at), changefreq="monthly", priority="0.85"))

    add_entries_safely("category", add_categories)
    add_entries_safely("product", add_products)
    add_entries_safely("blog category", add_blog_categories)
    add_entries_safely("blog article", add_articles)

    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        f"{''.join(entries)}"
        "</urlset>"
    )
    return Response(content=xml, media_type="application/xml")


@router.get("/robots.txt", include_in_schema=False)
def robots_txt():
    base = site_url()
    content = "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            "Disallow: /admin",
            "Disallow: /account",
            "Disallow: /checkout",
            f"Sitemap: {base}/sitemap.xml",
            "",
        ]
    )
    return Response(content=content, media_type="text/plain")
