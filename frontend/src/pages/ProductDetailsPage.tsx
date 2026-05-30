import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { assetUrl, productApi, wishlistApi, type ProductReview, type WishlistItem, type WholesaleTier } from '../services/api';
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
          aria-label={onRate ? `Chọn ${star} sao` : `${star} sao`}
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

type ProductVariantOption = {
  code: string;
  name: string;
  retail_price?: number;
  wholesale_price?: number;
  image_url?: string;
  stock?: number;
  discount_percent?: number;
  discount_start_time?: string;
  discount_end_time?: string;
};

function parseVariantOptions(value: string | null | undefined): ProductVariantOption[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => ({
          code: String(item?.code || item?.sku || '').trim(),
          name: String(item?.name || '').trim(),
          retail_price: Number.isFinite(Number(item?.retail_price)) ? Number(item.retail_price) : undefined,
          wholesale_price: Number.isFinite(Number(item?.wholesale_price)) ? Number(item.wholesale_price) : undefined,
          image_url: item?.image_url ? String(item.image_url).trim() : undefined,
          stock: Number.isFinite(Number(item?.stock)) ? Number(item.stock) : undefined,
          discount_percent: Number.isFinite(Number(item?.discount_percent)) ? Number(item.discount_percent) : undefined,
          discount_start_time: item?.discount_start_time ? String(item.discount_start_time) : undefined,
          discount_end_time: item?.discount_end_time ? String(item.discount_end_time) : undefined,
        }))
        .filter((item) => item.name || item.code);
    }
  } catch {
    return [];
  }
  return [];
}

function compactMoney(value: number) {
  if (value >= 1000000) return `${value / 1000000}tr`;
  if (value >= 1000) return `${value / 1000}k`;
  return String(value);
}

function isVariantDiscountActive(variant: ProductVariantOption | undefined) {
  if (!variant?.discount_percent || !variant.discount_start_time || !variant.discount_end_time) return false;
  const now = Date.now();
  return now >= new Date(variant.discount_start_time).getTime() && now <= new Date(variant.discount_end_time).getTime();
}

function truncateSeoText(value: string, maxLength = 155) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
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
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUser = authStorage.getUser();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [purchaseMode, setPurchaseMode] = useState<'retail' | 'wholesale'>('retail');
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [wholesaleTiers, setWholesaleTiers] = useState<WholesaleTier[]>([]);

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
          setSelectedVariantIndex(0);
          setSelectedImage(null);
          setReviews(reviewsRes.data);
          const currentIds = JSON.parse(localStorage.getItem('tmc_recent_product_ids') || '[]') as number[];
          localStorage.setItem('tmc_recent_product_ids', JSON.stringify([pid, ...currentIds.filter((item) => item !== pid)].slice(0, 12)));

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

  useEffect(() => {
    productApi.getWholesaleTiers().then((res) => setWholesaleTiers(res.data)).catch(() => setWholesaleTiers([]));
  }, []);

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
  const variants = useMemo(() => parseVariantOptions(product?.variant_options), [product?.variant_options]);
  const selectedVariant = variants[selectedVariantIndex];

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
  const variantBasePrice = selectedVariant?.retail_price || product?.retail_price || 0;
  const activeVariantDiscount = isVariantDiscountActive(selectedVariant) ? selectedVariant : null;
  const salePrice = activeVariantDiscount
    ? Math.round(variantBasePrice * (1 - (activeVariantDiscount.discount_percent || 0) / 100))
    : activeDiscount
      ? Math.round(variantBasePrice * (1 - activeDiscount.discount_percent / 100))
      : null;
  const retailUnitPrice = salePrice || variantBasePrice;
  const retailSubtotal = retailUnitPrice * quantity;
  const wholesaleBreaks = (wholesaleTiers.length > 0 ? wholesaleTiers : [
    { id: 0, name: 'Giá sỉ cấp độ 1', min_order_total: 2000000, max_order_total: 8000000, discount_percent: 5, is_active: true, note: null, created_at: null, updated_at: null },
    { id: 1, name: 'Giá sỉ cấp độ 2', min_order_total: 8000000, max_order_total: 15000000, discount_percent: 10, is_active: true, note: null, created_at: null, updated_at: null },
  ]).map((tier) => ({
    label: tier.max_order_total ? `${compactMoney(tier.min_order_total)} - ${compactMoney(tier.max_order_total)}` : `>= ${compactMoney(tier.min_order_total)}`,
    name: tier.name,
    minTotal: tier.min_order_total,
    maxTotal: tier.max_order_total,
    discountPercent: tier.discount_percent,
  }));
  const selectedWholesaleBreak =
    wholesaleBreaks.find((item) => retailSubtotal >= item.minTotal && (item.maxTotal == null || retailSubtotal < item.maxTotal)) ||
    wholesaleBreaks[0];
  const wholesaleBasePrice = selectedVariant?.wholesale_price || product?.wholesale_price || retailUnitPrice;
  const currentUnitPrice =
    purchaseMode === 'wholesale'
      ? Math.round(wholesaleBasePrice * (1 - selectedWholesaleBreak.discountPercent / 100))
      : retailUnitPrice;

  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const canIncrease = quantity < currentStock;
  const isOutOfStock = currentStock <= 0;

  useEffect(() => {
    if (!product) return;

    const title = `${product.name} | ${product.brand?.name || 'TMC Medical Vietnam'}`;
    const description = truncateSeoText(
      product.description ||
        `Mua ${product.name} chính hãng tại TMC Medical Vietnam. Xem giá, tình trạng hàng, mô tả sản phẩm và đặt mua trực tuyến.`,
    );
    const canonicalUrl = `${window.location.origin}/product/${product.id}`;
    const imageUrl = assetUrl(product.image_url || product.images?.[0]?.image_url || '');
    const absoluteImageUrl = imageUrl ? new URL(imageUrl, window.location.origin).href : `${window.location.origin}/logo.png`;
    const price = salePrice || variantBasePrice || product.retail_price;

    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: product.is_active ? 'index,follow' : 'noindex,follow' });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'product' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: absoluteImageUrl });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: absoluteImageUrl });
    upsertLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description,
      image: absoluteImageUrl,
      brand: product.brand?.name ? { '@type': 'Brand', name: product.brand.name } : undefined,
      category: product.category?.name,
      sku: selectedVariant?.code || product.product_code || String(product.id),
      aggregateRating: product.avg_rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.avg_rating,
            reviewCount: product.review_count || 1,
          }
        : undefined,
      offers: {
        '@type': 'Offer',
        url: canonicalUrl,
        priceCurrency: 'VND',
        price,
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
    };

    let jsonLd = document.getElementById('product-jsonld') as HTMLScriptElement | null;
    if (!jsonLd) {
      jsonLd = document.createElement('script');
      jsonLd.id = 'product-jsonld';
      jsonLd.type = 'application/ld+json';
      document.head.appendChild(jsonLd);
    }
    jsonLd.textContent = JSON.stringify(schema);
  }, [product, salePrice, selectedVariant?.code, variantBasePrice]);

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
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const displayProduct = selectedVariant
      ? {
          ...product,
          name: `${product.name} - ${selectedVariant.name || selectedVariant.code}`,
          image_url: selectedVariant.image_url || product.image_url,
          retail_price: retailUnitPrice,
          wholesale_price: selectedVariant.wholesale_price || product.wholesale_price,
          stock: currentStock,
        }
      : product;
    cartStorage.addItem(
      displayProduct,
      quantity,
      selectedVariant ? { code: selectedVariant.code || selectedVariant.name, name: selectedVariant.name } : undefined,
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (!isOutOfStock) {
      navigate('/checkout');
    }
  };

  return (
    <div className="bg-[#fbfaf7] font-sans antialiased">
      <div className="mx-auto max-w-[1180px] px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
          <Link to="/" className="transition hover:text-emerald-800">{t('header.home')}</Link>
          <span>/</span>
          <Link to="/shop" className="transition hover:text-emerald-800">{t('header.shop')}</Link>
          <span>/</span>
          <span className="max-w-[22rem] truncate text-stone-700">{product.name}</span>
        </nav>

      <section>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:gap-12">
          <div>
            <div className="relative overflow-hidden rounded-lg border border-stone-200 bg-white p-3 shadow-sm sm:p-4 lg:sticky lg:top-24">
              <div className="relative flex h-full flex-col gap-5">
                <div className="flex flex-wrap items-center gap-3">
                  {product.badge ? (
                    <span className="rounded-md bg-emerald-950 px-3 py-1.5 text-xs font-semibold uppercase text-white">
                      {product.badge}
                    </span>
                  ) : null}
                  {product.brand?.name ? (
                    <span className="rounded-md border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase text-stone-700">
                      {product.brand.name}
                    </span>
                  ) : null}
                </div>

                <div className="group relative flex aspect-square max-h-[540px] w-full overflow-hidden rounded-lg border border-stone-100 bg-[#f7f3ed]">
                  {(selectedImage || product.image_url) ? (
                    <img
                      className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-[1.02] sm:p-4"
                      alt={product.name}
                      src={assetUrl(selectedImage || selectedVariant?.image_url || product.image_url)}
                      width={760}
                      height={760}
                    />
                  ) : (
                    <div className="flex h-full min-h-[300px] w-full items-center justify-center bg-stone-100 text-emerald-900">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-5xl">image</span>
                        <p className="mt-4 text-sm font-medium">{t('product.image_unavailable')}</p>
                      </div>
                    </div>
                  )}
                </div>

                {allImages.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        aria-label="Xem ảnh sản phẩm"
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white transition sm:h-[4.5rem] sm:w-[4.5rem] ${
                          (img.id === 0 && !selectedImage) || selectedImage === img.image_url
                            ? 'border-emerald-800 shadow-sm'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        onClick={() => img.id === 0 ? setSelectedImage(null) : setSelectedImage(img.image_url)}
                      >
                        <img className="h-full w-full object-cover" alt="" src={assetUrl(img.image_url)} width={80} height={80} loading="lazy" decoding="async" />
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-3">
                  {infoHighlights.map((item) => (
                    <div key={item.title} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-emerald-50 text-emerald-800">
                        <span className="material-symbols-outlined text-lg">{item.icon}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-stone-950">{item.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-stone-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex h-full flex-col lg:pt-2">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {product.category?.name ? (
                  <span className="rounded-md bg-[#f1eadf] px-3 py-1.5 text-xs font-semibold uppercase text-stone-700">
                    {product.category.name}
                  </span>
                ) : null}
                <span
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold uppercase ${
                    isOutOfStock
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {isOutOfStock ? t('product.out_of_stock') : t('product.stock_left', { count: currentStock })}
                </span>
              </div>

              <h1 className="max-w-2xl text-2xl font-semibold leading-tight text-stone-950 sm:text-3xl lg:text-[2rem]">
                {product.name}
              </h1>

              <div className="mt-6 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
                {variants.length > 0 ? (
                  <div className="mb-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase text-stone-500">Mã sản phẩm / size</p>
                      <span className="text-sm font-semibold text-emerald-800">{selectedVariant?.code || selectedVariant?.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {variants.map((variant, index) => (
                        <button
                          key={`${variant.code || variant.name}-${index}`}
                          type="button"
                          onClick={() => {
                            setSelectedVariantIndex(index);
                            setSelectedImage(variant.image_url || null);
                            setQuantity(1);
                          }}
                          className={`min-h-[4.25rem] rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                            selectedVariantIndex === index
                              ? 'border-emerald-800 bg-emerald-50 text-emerald-950 shadow-sm'
                              : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-200'
                          } ${variant.stock === 0 ? 'opacity-45' : ''}`}
                        >
                          <span className="flex items-center gap-2">
                            {variant.image_url ? <img src={assetUrl(variant.image_url)} alt="" className="h-9 w-9 rounded-lg object-cover" width={36} height={36} loading="lazy" decoding="async" /> : null}
                            <span className="line-clamp-2">{variant.name || variant.code}</span>
                          </span>
                          <span className="mt-1 block text-[11px] font-medium text-stone-500">
                            {variant.code ? `Mã ${variant.code} • ` : ''}{variant.stock === 0 ? 'Hết hàng' : `${variant.stock ?? product.stock} sản phẩm`}
                          </span>
                          {variant.retail_price ? (
                            <span className="mt-1 block text-xs font-bold text-emerald-800">{formatCurrency(variant.retail_price)}</span>
                          ) : null}
                          {isVariantDiscountActive(variant) ? (
                            <span className="mt-1 block text-[11px] font-bold text-red-600">Sale -{variant.discount_percent}%</span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-stone-200 bg-stone-100/70 p-1.5">
                  {(['retail', 'wholesale'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setPurchaseMode(mode);
                        setQuantity(mode === 'wholesale' ? Math.max(quantity, 1) : Math.min(quantity, currentStock || quantity));
                      }}
                      className={`relative rounded-lg px-4 py-3 text-sm font-bold transition sm:py-3.5 ${
                        purchaseMode === mode
                          ? mode === 'wholesale'
                            ? 'bg-gradient-to-r from-amber-500 to-red-500 text-white shadow-[0_10px_24px_rgba(239,68,68,0.22)]'
                            : 'bg-emerald-950 text-white shadow-[0_10px_24px_rgba(6,78,59,0.18)]'
                          : mode === 'wholesale'
                            ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100'
                            : 'bg-white text-stone-600 hover:bg-emerald-50 hover:text-emerald-900'
                      }`}
                    >
                      <span className="block">{mode === 'retail' ? 'Mua lẻ' : 'Mua sỉ'}</span>
                      {mode === 'wholesale' ? (
                        <span className={`mt-0.5 block text-[11px] font-semibold ${purchaseMode === mode ? 'text-white/90' : 'text-red-600'}`}>
                          Giá sỉ tốt hơn
                        </span>
                      ) : (
                        <span className={`mt-0.5 block text-[11px] font-semibold ${purchaseMode === mode ? 'text-white/80' : 'text-stone-400'}`}>
                          Giá bán lẻ
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {activeDiscount || activeVariantDiscount ? (
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-red-500 px-4 py-1.5 text-[11px] font-bold text-white">-{Math.round(activeVariantDiscount?.discount_percent || activeDiscount?.discount_percent || 0)}%</span>
                    <CountdownBanner endTime={activeVariantDiscount?.discount_end_time || activeDiscount?.end_time || new Date().toISOString()} />
                  </div>
                ) : null}
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">{t('product.retail_price')}</p>
                    <div className="mt-2 flex items-end gap-3">
                      {salePrice ? (
                        <>
                          <span className="text-2xl font-bold text-red-600 sm:text-3xl">{formatCurrency(salePrice)}</span>
                          <span className="text-base text-stone-400 line-through">{formatCurrency(variantBasePrice || product.retail_price)}</span>
                        </>
                      ) : (
                        <span className="text-2xl font-semibold text-emerald-950 sm:text-3xl">{formatCurrency(variantBasePrice || product.retail_price)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {product.wholesale_price ? (
                  <p className="mt-4 text-sm leading-7 text-stone-500">
                    Giá sỉ sẽ tự đổi theo tổng tiền hàng hiện tại. Mốc đang áp dụng: {selectedWholesaleBreak.name} ({selectedWholesaleBreak.discountPercent}%).
                  </p>
                ) : null}

                {purchaseMode === 'wholesale' ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {wholesaleBreaks.map((tier) => (
                      <button
                        key={tier.label}
                        type="button"
                        onClick={() => {
                          const targetQuantity = Math.max(1, Math.ceil(tier.minTotal / Math.max(retailUnitPrice, 1)));
                          setQuantity(Math.min(targetQuantity, currentStock || targetQuantity));
                        }}
                      className={`rounded-lg border p-4 text-left transition ${
                          selectedWholesaleBreak.label === tier.label
                            ? 'border-red-300 bg-gradient-to-br from-amber-50 to-red-50 text-red-950 shadow-[0_10px_24px_rgba(239,68,68,0.12)]'
                            : 'border-amber-200 bg-white text-stone-700 hover:border-red-200 hover:bg-amber-50'
                        }`}
                      >
                        <span className="block text-xs font-semibold uppercase text-amber-700">Tổng đơn {tier.label}</span>
                        <span className="mt-2 block text-lg font-extrabold text-red-600">{formatCurrency(Math.round(wholesaleBasePrice * (1 - tier.discountPercent / 100)))}</span>
                        <span className="mt-1 block text-xs font-semibold text-stone-600">{tier.name} - giảm {tier.discountPercent}%</span>
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 grid gap-3 rounded-lg bg-stone-50 p-4">
                  {details.map((detail) => (
                    <div key={detail.label} className="flex items-center justify-between gap-4 border-b border-stone-200/80 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-sm font-medium text-stone-500">{detail.label}</span>
                      <span className="text-sm font-semibold text-stone-950">{detail.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-emerald-950/10 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-stone-500">{t('product.quantity')}</p>
                    <div className="mt-3 inline-flex items-center rounded-lg border border-stone-200 bg-white p-1 shadow-sm">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        aria-label="Giảm số lượng"
                        className="flex h-10 w-10 items-center justify-center rounded-md text-emerald-950 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={quantity <= 1}
                      >
                        <span className="material-symbols-outlined text-base">remove</span>
                      </button>
                      <span className="min-w-[3rem] text-center text-lg font-bold text-slate-900">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        aria-label="Tăng số lượng"
                        className="flex h-10 w-10 items-center justify-center rounded-md text-emerald-950 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={purchaseMode === 'retail' ? !canIncrease : quantity >= currentStock}
                      >
                        <span className="material-symbols-outlined text-base">add</span>
                      </button>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold uppercase text-stone-500">{t('product.estimated_total')}</p>
                    <div className="mt-2 text-xl font-semibold text-stone-950 sm:text-2xl">
                      {purchaseMode === 'wholesale' ? (
                        <span className="text-emerald-950">{formatCurrency(currentUnitPrice * quantity)}</span>
                      ) : salePrice ? (
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

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="inline-flex items-center justify-center gap-3 rounded-lg bg-emerald-950 px-5 py-3.5 text-sm font-semibold uppercase text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-stone-300"
                  >
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                    {added ? t('product.added_to_cart') : t('product.add_to_cart')}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-red-600 to-pink-500 px-5 py-3.5 text-sm font-semibold uppercase text-white shadow-[0_12px_26px_rgba(225,29,72,0.24)] transition hover:from-red-700 hover:to-pink-600 disabled:cursor-not-allowed disabled:bg-none disabled:bg-stone-300 disabled:shadow-none"
                  >
                    <span className="material-symbols-outlined text-base">bolt</span>
                    Mua ngay
                  </button>
                  <Link
                    to="/cart"
                    className="inline-flex items-center justify-center gap-3 rounded-lg border border-stone-300 bg-white px-5 py-3.5 text-sm font-semibold uppercase text-stone-800 transition hover:border-emerald-800 hover:text-emerald-950"
                  >
                    <span className="material-symbols-outlined text-base">shopping_bag</span>
                    {t('product.view_cart')}
                  </Link>
                </div>

                {currentUser ? (
                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                      isWishlisted
                        ? 'bg-pink-500 text-white shadow-[0_10px_24px_rgba(236,72,153,0.24)] hover:bg-pink-600'
                        : 'border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 hover:text-pink-800'
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
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition hover:text-emerald-800"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  {t('product.continue_shopping')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="p-5 sm:p-6 lg:p-8 lg:pr-10">
            <p className="text-xs font-semibold uppercase text-emerald-800">Mô tả chi tiết</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl">
              Thông tin sản phẩm
            </h2>
            <div className="mt-5 whitespace-pre-line text-base leading-7 text-stone-700">
              {product.description || t('product.description_fallback')}
            </div>
          </div>
          <aside
            aria-labelledby="product-summary-title"
            className="border-t border-stone-200 bg-[#fcfaf6] p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-8"
            itemScope
            itemType="https://schema.org/Product"
          >
            <meta itemProp="name" content={product.name} />
            <meta itemProp="sku" content={selectedVariant?.code || product.product_code || String(product.id)} />
            {product.brand?.name ? <meta itemProp="brand" content={product.brand.name} /> : null}
            {product.category?.name ? <meta itemProp="category" content={product.category.name} /> : null}
            <div
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
              className="sr-only"
            >
              <meta itemProp="priceCurrency" content="VND" />
              <meta itemProp="price" content={String(salePrice || variantBasePrice || product.retail_price)} />
              <link itemProp="availability" href={product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'} />
            </div>

            <p className="text-xs font-semibold uppercase text-emerald-800">Tóm tắt sản phẩm</p>
            <h3 id="product-summary-title" className="mt-2 text-lg font-semibold leading-snug text-stone-950">
              {product.name}
            </h3>

            <dl className="mt-5 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-3">
                <dt className="text-xs font-semibold uppercase text-stone-500">Mã SP</dt>
                <dd className="text-sm font-semibold text-stone-950">#{product.id}</dd>
              </div>
              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-3">
                <dt className="text-xs font-semibold uppercase text-stone-500">{t('product.brand')}</dt>
                <dd className="text-sm font-semibold text-stone-950">{product.brand?.name || t('product.not_available')}</dd>
              </div>
              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-3">
                <dt className="text-xs font-semibold uppercase text-stone-500">{t('product.category')}</dt>
                <dd className="text-sm font-semibold text-stone-950">{product.category?.name || t('product.not_available')}</dd>
              </div>
              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-3">
                <dt className="text-xs font-semibold uppercase text-stone-500">Giá bán</dt>
                <dd className="text-sm font-bold text-emerald-950">
                  {formatCurrency(salePrice || variantBasePrice || product.retail_price)}
                  {salePrice ? <span className="ml-2 font-medium text-stone-400 line-through">{formatCurrency(variantBasePrice || product.retail_price)}</span> : null}
                </dd>
              </div>
              <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-3">
                <dt className="text-xs font-semibold uppercase text-stone-500">{t('product.status')}</dt>
                <dd>
                  <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${isOutOfStock ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'}`}>
                    {isOutOfStock ? t('product.out_of_stock') : t('product.stock_left', { count: currentStock })}
                  </span>
                </dd>
              </div>
              {product.avg_rating ? (
                <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-3" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                  <dt className="text-xs font-semibold uppercase text-stone-500">Đánh giá</dt>
                  <dd className="text-sm font-semibold text-stone-950">
                    <span itemProp="ratingValue">{product.avg_rating.toFixed(1)}</span>/5
                    <span className="text-stone-500"> từ <span itemProp="reviewCount">{product.review_count}</span> đánh giá</span>
                  </dd>
                </div>
              ) : null}
              {variants.length > 0 ? (
                <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase text-stone-500">Mã / size</dt>
                  <dd className="text-sm font-semibold text-stone-950">{variants.length} lựa chọn</dd>
                </div>
              ) : null}
              {allImages.length > 1 ? (
                <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-3">
                  <dt className="text-xs font-semibold uppercase text-stone-500">Hình ảnh</dt>
                  <dd className="text-sm font-semibold text-stone-950">{allImages.length} ảnh sản phẩm</dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-14">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase text-emerald-800">Đánh giá</p>
          <div className="mt-3 flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-stone-950 sm:text-3xl">Đánh giá sản phẩm</h2>
            {product.avg_rating ? (
              <div className="flex items-center gap-2">
                <StarRating rating={Math.round(product.avg_rating)} />
                <span className="text-sm font-semibold text-stone-500">({product.review_count})</span>
              </div>
            ) : null}
          </div>
        </div>

        {currentUser ? (
          <div className="mb-8 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold text-stone-900">Viết đánh giá</h3>
            <div className="mt-3 flex items-center gap-3">
              <StarRating rating={reviewRating} onRate={setReviewRating} />
            </div>
            <textarea
              className="mt-3 w-full rounded-lg border border-stone-200 bg-white px-4 py-3 outline-none focus:border-emerald-800"
              rows={3}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
            />
            {reviewError ? (
              <p className="mt-2 text-sm text-red-600">{reviewError}</p>
            ) : null}
            <button
              className="mt-3 rounded-lg bg-emerald-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-900 disabled:opacity-50"
              disabled={submittingReview}
              onClick={handleSubmitReview}
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        ) : (
          <div className="mb-8 rounded-lg border border-stone-200 bg-white p-5 text-center">
            <p className="text-stone-500">
              <Link to="/login" className="font-semibold text-emerald-800 hover:underline">Đăng nhập</Link> để viết đánh giá.
            </p>
          </div>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-stone-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-800">
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
          <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
            <p className="text-stone-500">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        )}
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-800">{t('product.related_label')}</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl">{t('home.recommended_title')}</h2>
              <p className="mt-2 text-stone-500">{t('product.related_desc')}</p>
            </div>
            <Link to="/shop" className="hidden text-sm font-semibold text-emerald-800 transition hover:text-emerald-950 sm:inline-flex">
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
    </div>
  );
}
