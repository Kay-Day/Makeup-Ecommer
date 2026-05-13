import { Link, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { productApi, wishlistApi, type ProductReview, type WishlistItem } from '../services/api';
import type { Product } from '../services/api';
import { ProductCard } from '../components/ui/ProductCard';
import { cartStorage } from '../services/cart';
import { authStorage } from '../services/api';
import type { ProductDiscount } from '../services/api';

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('vi-VN');
}

function StarRating({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onRate}
          className={`text-xl transition ${onRate ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${star <= rating ? 'text-amber-400' : 'text-stone-300'}`}
          onClick={() => onRate?.(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function isDiscountActive(discount: ProductDiscount): boolean {
  const now = new Date().getTime();
  const start = new Date(discount.start_time).getTime();
  const end = new Date(discount.end_time).getTime();
  return discount.is_active && now >= start && now <= end;
}

function CountdownBanner({ endTime }: { endTime: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, new Date(endTime).getTime() - now);
  if (diff === 0) return <p className="text-sm text-red-600 font-semibold">Khuyến mai da ket thuc</p>;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
      <span className="material-symbols-outlined text-base">schedule</span>
      <span>Ket thuc sau: </span>
      <span className="tabular-nums">
        {days > 0 ? `${days}d ` : ''}
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const currentUser = authStorage.getUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (id) {
          const pid = parseInt(id);
          const [productRes, reviewsRes] = await Promise.all([
            productApi.getById(pid),
            productApi.getReviews(pid),
          ]);
          setProduct(productRes.data);
          setReviews(reviewsRes.data);

          if (productRes.data.category_id) {
            const relatedRes = await productApi.getAll({ category_id: productRes.data.category_id });
            setRelatedProducts(relatedRes.data.filter(p => p.id !== productRes.data.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (currentUser) {
      wishlistApi.getAll().then((res) => setWishlistItems(res.data)).catch(() => {});
    }
  }, [currentUser]);

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = product.images?.length ? [...product.images].sort((a, b) => a.sort_order - b.sort_order) : [];
    if (product.image_url) {
      imgs.unshift({ id: 0, product_id: product.id, image_url: product.image_url, sort_order: -1 });
    }
    return imgs;
  }, [product]);

  const isWishlisted = useMemo(
    () => wishlistItems.some((item) => item.product_id === product?.id),
    [wishlistItems, product],
  );

  const handleToggleWishlist = async () => {
    if (!currentUser || !product || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await wishlistApi.remove(product.id);
        setWishlistItems((prev) => prev.filter((item) => item.product_id !== product.id));
      } else {
        const res = await wishlistApi.add(product.id);
        setWishlistItems((prev) => [...prev, res.data]);
      }
    } catch {
      // ignore
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!product || !currentUser) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await productApi.createReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviews((prev) => [res.data, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      // Refresh product to get updated avg_rating
      const productRes = await productApi.getById(product.id);
      setProduct(productRes.data);
    } catch (error: any) {
      setReviewError(error?.response?.data?.detail || 'Không thể gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  const infoHighlights = useMemo(
    () => [
      {
        icon: 'verified',
        title: t('product.highlight_authentic_title'),
        description: t('product.highlight_authentic_desc'),
      },
      {
        icon: 'local_shipping',
        title: t('product.highlight_shipping_title'),
        description: t('product.highlight_shipping_desc'),
      },
      {
        icon: 'support_agent',
        title: t('product.highlight_support_title'),
        description: t('product.highlight_support_desc'),
      },
    ],
    [t],
  );

  const details = useMemo(
    () => [
      { label: t('product.brand'), value: product?.brand?.name || t('product.not_available') },
      { label: t('product.category'), value: product?.category?.name || t('product.not_available') },
      {
        label: t('product.status'),
        value: product && product.stock > 0 ? t('product.in_stock') : t('product.out_of_stock'),
      },
    ],
    [product, t],
  );

  const activeDiscount = product?.discount && isDiscountActive(product.discount) ? product.discount : null;
  const salePrice = activeDiscount ? Math.round(product!.retail_price * (1 - activeDiscount.discount_percent / 100)) : null;

  const currentStock = product?.stock ?? 0;
  const canIncrease = quantity < currentStock;
  const isOutOfStock = currentStock <= 0;

  if (loading) {
    return <div className="py-20 text-center text-stone-500">{t('shop.loading')}</div>;
  }

  if (!product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-[900px] items-center justify-center px-6 py-20">
        <div className="w-full rounded-[2rem] border border-stone-200 bg-white px-8 py-16 text-center shadow-[0_24px_60px_rgba(24,58,92,0.08)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-sky-700">
            <span className="material-symbols-outlined text-3xl">inventory_2</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{t('product.not_found_title')}</h1>
          <p className="mx-auto mt-3 max-w-xl text-stone-500">{t('product.not_found_desc')}</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-800"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {t('product.back_to_shop')}
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    cartStorage.addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-10 sm:px-8 md:px-12 xl:px-16">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-stone-400">
        <Link to="/" className="transition hover:text-sky-700">{t('header.home')}</Link>
        <span>/</span>
        <Link to="/shop" className="transition hover:text-sky-700">{t('header.shop')}</Link>
        <span>/</span>
        <span className="text-sky-700">{product.name}</span>
      </nav>

      <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-[linear-gradient(135deg,#f9fdff_0%,#ffffff_40%,#eef7ff_100%)] shadow-[0_30px_80px_rgba(24,58,92,0.08)]">
        <div className="grid grid-cols-1 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <div className="relative h-full min-h-[420px] border-b border-sky-100/70 p-5 sm:p-8 xl:border-b-0 xl:border-r">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(125,211,252,0.24),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.10),transparent_28%)]" />
              <div className="relative flex h-full flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  {product.badge ? (
                    <span className="rounded-full bg-sky-700 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                      {product.badge}
                    </span>
                  ) : null}
                  {product.brand?.name ? (
                    <span className="rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
                      {product.brand.name}
                    </span>
                  ) : null}
                </div>

                <div className="group relative flex-1 overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_25px_70px_rgba(24,58,92,0.12)]">
                  {(selectedImage || product.image_url) ? (
                    <img
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      alt={product.name}
                      src={selectedImage || product.image_url || ''}
                    />
                  ) : (
                    <div className="flex h-full min-h-[420px] items-center justify-center bg-sky-50 text-sky-700">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-6xl">image</span>
                        <p className="mt-4 text-sm font-medium">{t('product.image_unavailable')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {allImages.length > 1 ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {allImages.map((img) => (
                      <button
                        key={img.id}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                          (img.id === 0 && !selectedImage) || selectedImage === img.image_url
                            ? 'border-sky-500'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => img.id === 0 ? setSelectedImage(null) : setSelectedImage(img.image_url)}
                      >
                        <img className="h-full w-full object-cover" alt="" src={img.image_url} />
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-3">
                  {infoHighlights.map((item) => (
                    <div key={item.title} className="rounded-[1.4rem] border border-sky-100 bg-white/90 p-4 shadow-[0_12px_30px_rgba(24,58,92,0.05)]">
                      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-stone-500">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-5">
            <div className="flex h-full flex-col p-6 sm:p-8 xl:p-10">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {product.category?.name ? (
                  <span className="rounded-full bg-sky-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
                    {product.category.name}
                  </span>
                ) : null}
                <span
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${
                    isOutOfStock
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isOutOfStock ? t('product.out_of_stock') : t('product.stock_left', { count: product.stock })}
                </span>
              </div>

              <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-[2.6rem]">
                {product.name}
              </h1>

              <p className="mt-5 text-base leading-8 text-stone-600">
                {product.description || t('product.description_fallback')}
              </p>

              <div className="mt-8 rounded-[1.75rem] border border-sky-100 bg-white p-6 shadow-[0_18px_45px_rgba(24,58,92,0.06)]">
                {activeDiscount ? (
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-bold text-white">-{Math.round(activeDiscount.discount_percent)}%</span>
                    <CountdownBanner endTime={activeDiscount.end_time} />
                  </div>
                ) : null}
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">{t('product.retail_price')}</p>
                    <div className="mt-2 flex items-end gap-3">
                      {salePrice ? (
                        <>
                          <span className="text-3xl font-bold text-red-600 sm:text-4xl">{formatCurrency(salePrice)}</span>
                          <span className="text-xl text-stone-400 line-through">{formatCurrency(product.retail_price)}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold text-sky-800 sm:text-4xl">{formatCurrency(product.retail_price)}</span>
                      )}
                    </div>
                  </div>
                  {product.wholesale_price ? (
                    <div className="rounded-2xl bg-sky-50 px-5 py-4 text-right">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700">{t('product.wholesale_price')}</p>
                      <div className="mt-1 text-xl font-bold text-sky-900">
                        {formatCurrency(product.wholesale_price)}
                      </div>
                    </div>
                  ) : null}
                </div>

                {product.wholesale_price ? (
                  <p className="mt-4 text-sm leading-7 text-stone-500">
                    {t('product.wholesale_note')}
                  </p>
                ) : null}

                <div className="mt-6 grid gap-3 rounded-[1.3rem] bg-slate-50 p-4">
                  {details.map((detail) => (
                    <div key={detail.label} className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-sm font-medium text-stone-500">{detail.label}</span>
                      <span className="text-sm font-semibold text-slate-900">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-[1.75rem] border border-sky-100 bg-sky-950/[0.02] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">{t('product.quantity')}</p>
                    <div className="mt-3 inline-flex items-center rounded-full border border-sky-100 bg-white p-1 shadow-sm">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sky-800 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={quantity <= 1}
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <span className="min-w-[3rem] text-center text-lg font-bold text-slate-900">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sky-800 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!canIncrease}
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">{t('product.estimated_total')}</p>
                    <div className="mt-2 text-2xl font-bold text-slate-900">
                      {salePrice ? (
                        <>
                          <span className="text-red-600">{formatCurrency(salePrice * quantity)}</span>
                          <span className="ml-2 text-sm text-stone-400 line-through">{formatCurrency(product.retail_price * quantity)}</span>
                        </>
                      ) : (
                        formatCurrency(product.retail_price * quantity)
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-sky-700 px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                    {added ? t('product.added_to_cart') : t('product.add_to_cart')}
                  </button>
                  <Link
                    to="/cart"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-sky-200 bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-sky-700 transition hover:bg-sky-50"
                  >
                    <span className="material-symbols-outlined text-base">shopping_bag</span>
                    {t('product.view_cart')}
                  </Link>
                </div>

                {currentUser ? (
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                      isWishlisted
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {wishlistLoading ? 'hourglass_top' : isWishlisted ? 'favorite' : 'favorite_border'}
                    </span>
                    {wishlistLoading ? 'Đang xử lý...' : isWishlisted ? 'Đã yêu thích' : 'Thêm vào yêu thích'}
                  </button>
                ) : null}

                <Link
                  to="/shop"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-sky-700"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  {t('product.continue_shopping')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-16">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-600">Đánh giá</p>
          <div className="mt-3 flex items-center gap-4">
            <h2 className="text-3xl font-bold text-slate-900">Đánh giá sản phẩm</h2>
            {product.avg_rating ? (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(product.avg_rating)} />
                <span className="text-sm font-semibold text-stone-500">({product.review_count})</span>
              </div>
            ) : null}
          </div>
        </div>

        {currentUser ? (
          <div className="mb-8 rounded-[1.5rem] border border-stone-100 bg-stone-50/70 p-5">
            <h3 className="text-lg font-bold text-stone-900">Viết đánh giá</h3>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={reviewRating} onRate={setReviewRating} />
            </div>
            <textarea
              className="mt-3 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 outline-none focus:border-sky-500"
              rows={3}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            {reviewError ? (
              <p className="mt-2 text-sm text-red-600">{reviewError}</p>
            ) : null}
            <button
              className="mt-3 rounded-xl bg-sky-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-sky-800 disabled:opacity-50"
              disabled={submittingReview}
              onClick={handleSubmitReview}
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        ) : (
          <div className="mb-8 rounded-[1.5rem] border border-stone-100 bg-stone-50/70 p-5 text-center">
            <p className="text-stone-500">
              <Link to="/login" className="font-semibold text-sky-700 hover:underline">Đăng nhập</Link> để viết đánh giá.
            </p>
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-[1.25rem] border border-stone-100 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                    {review.user?.full_name?.slice(0, 1) || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">{review.user?.full_name || 'Ẩn danh'}</p>
                    <p className="text-xs text-stone-400">{formatDate(review.created_at)}</p>
                  </div>
                  <div className="ml-auto">
                    <StarRating rating={review.rating} />
                  </div>
                </div>
                {review.comment ? (
                  <p className="mt-3 text-stone-600 leading-relaxed">{review.comment}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-stone-100 bg-stone-50/70 p-8 text-center">
            <p className="text-stone-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-sky-600">{t('product.related_label')}</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">{t('home.recommended_title')}</h2>
              <p className="mt-2 text-stone-500">{t('product.related_desc')}</p>
            </div>
            <Link to="/shop" className="hidden text-sm font-semibold text-sky-700 transition hover:text-sky-900 sm:inline-flex">
              {t('home.view_all')}
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map(p => (
              <Link key={p.id} to={`/product/${p.id}`} className="block">
                <ProductCard
                  id={p.id.toString()}
                  name={p.name}
                  subtitle={p.category?.name || ''}
                  brandName={p.brand?.name || undefined}
                  price={p.retail_price}
                  imageUrl={p.image_url || ''}
                  badge={p.badge || undefined}
                  discount={p.discount}
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
