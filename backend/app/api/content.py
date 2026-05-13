from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_db
from app.models.blog_article import BlogArticle
from app.models.blog_category import BlogCategory
from app.schemas import BlogArticleOut, BlogCategoryOut

router = APIRouter(tags=["Content"])


@router.get("/blog-categories", response_model=list[BlogCategoryOut])
def list_blog_categories(db: Session = Depends(get_db)):
    return db.query(BlogCategory).order_by(BlogCategory.name.asc()).all()


@router.get("/blog-articles", response_model=list[BlogArticleOut])
def list_blog_articles(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(BlogArticle)
        .options(joinedload(BlogArticle.author), joinedload(BlogArticle.category))
        .filter(BlogArticle.is_published == True)
        .order_by(BlogArticle.created_at.desc())
    )
    if category_id:
        query = query.filter(BlogArticle.category_id == category_id)
    if search:
        query = query.filter(BlogArticle.title.ilike(f"%{search}%"))
    return query.all()


@router.get("/blog-articles/{article_id}", response_model=BlogArticleOut)
def get_blog_article(article_id: int, db: Session = Depends(get_db)):
    article = (
        db.query(BlogArticle)
        .options(joinedload(BlogArticle.author), joinedload(BlogArticle.category))
        .filter(BlogArticle.id == article_id, BlogArticle.is_published == True)
        .first()
    )
    if not article:
        raise HTTPException(status_code=404, detail="Blog article not found")
    return article
