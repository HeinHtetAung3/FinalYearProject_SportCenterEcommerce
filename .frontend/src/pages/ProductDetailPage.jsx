import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Rating from '../components/ui/Rating';
import EmptyState from '../components/feedback/EmptyState';
import { ProductDetailSkeleton } from '../components/feedback/Skeleton';
import {
  IconArrowRight,
  IconHeart,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconRuler,
  IconShield,
  IconTruck,
  IconZoomIn
} from '../components/ui/Icon';
import ProductRail from '../components/products/ProductRail';
import SizeGuideModal from '../components/products/SizeGuideModal';
import ImageLightbox from '../components/products/ImageLightbox';
import StickyMobileCTA from '../components/products/StickyMobileCTA';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCommerceConfig } from '../context/CommerceConfigContext';
import { useWishlist } from '../context/WishlistContext';
import { useUI } from '../context/UIContext';
import { fetchProductById, fetchRelatedProducts } from '../services/catalogService';
import { createReview, fetchReviews } from '../services/commerceService';
import { fetchUserSettings } from '../services/userSettingsService';
import { getProductGallery, IMAGE_PLACEHOLDER } from '../utils/firebaseStorage';
import { clearRecentlyViewed, getRecentlyViewed, recordRecentlyViewed } from '../utils/recentlyViewed';
import { classNames, formatCurrency } from '../utils/format';

const HIGHLIGHTS = [
  { icon: <IconTruck />, text: 'Free shipping over $75' },
  { icon: <IconRefresh />, text: '30-day free returns' },
  { icon: <IconShield />, text: '2-year manufacturer warranty' }
];

function ProductDetailPage() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showAddedToBag } = useUI();
  const { config: commerce } = useCommerceConfig();
  const reviewsEnabled = commerce?.reviewsEnabled !== false;
  const [product, setProduct] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sizeError, setSizeError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const [adding, setAdding] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const [related, setRelated] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [personalizedAds, setPersonalizedAds] = useState(true);
  const [dataSharing, setDataSharing] = useState(true);
  const [catalogTick, setCatalogTick] = useState(0);

  const detailTabs = useMemo(() => {
    const tabs = [{ key: 'description', label: 'Details' }];
    if (reviewsEnabled) {
      tabs.push({ key: 'reviews', label: `Reviews (${reviews.length})` });
    }
    tabs.push({ key: 'shipping', label: 'Shipping & returns' });
    return tabs;
  }, [reviews.length, reviewsEnabled]);

  useEffect(() => {
    if (!reviewsEnabled && activeTab === 'reviews') {
      setActiveTab('description');
    }
  }, [reviewsEnabled, activeTab]);

  const ctaRef = useRef(null);

  useEffect(() => {
    function onCatalogChanged() {
      setCatalogTick((t) => t + 1);
    }
    window.addEventListener('catalog:changed', onCatalogChanged);
    return () => window.removeEventListener('catalog:changed', onCatalogChanged);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const productData = await fetchProductById(productId);
        if (cancelled) return;
        setProduct(productData);
        setGallery(getProductGallery(productData, 4));
        setActiveImage(0);
        setSelectedSize(null);
        setSizeError('');
        setSelectedColor(
          Array.isArray(productData?.colors) && productData.colors.length > 0
            ? productData.colors[0]
            : null
        );
        let reviewData = [];
        try {
          reviewData = await fetchReviews(productId);
        } catch {
          reviewData = [];
        }
        if (!cancelled) setReviews(Array.isArray(reviewData) ? reviewData : []);
      } catch (apiError) {
        if (!cancelled) setError(apiError.message || 'Unable to load product.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [productId, catalogTick]);

  // Snapshot the freshly-loaded product into the "Recently viewed" history
  // and seed the rail with what we had stored before this visit (so the
  // current product is never present in its own recently-viewed list).
  useEffect(() => {
    if (!product) return;
    if (isAuthenticated && !dataSharing) {
      clearRecentlyViewed();
      setRecentlyViewed([]);
      return;
    }
    const previous = getRecentlyViewed().filter((item) => Number(item.id) !== Number(product.id));
    setRecentlyViewed(previous);
    recordRecentlyViewed(product);
  }, [product, isAuthenticated, dataSharing]);

  // Fetch related products once the current product has loaded.
  useEffect(() => {
    if (!product) {
      setRelated([]);
      return undefined;
    }
    let cancelled = false;
    fetchRelatedProducts(product, 8)
      .then((items) => {
        if (!cancelled) setRelated(items || []);
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [product]);

  useEffect(() => {
    if (!isAuthenticated) {
      setPersonalizedAds(true);
      setDataSharing(true);
      return;
    }
    let cancelled = false;
    fetchUserSettings()
      .then((s) => {
        if (!cancelled) {
          setPersonalizedAds(s.personalizedAds);
          setDataSharing(s.dataSharing);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPersonalizedAds(true);
          setDataSharing(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, productId]);

  // Show the sticky mobile CTA only after the in-page Add-to-bag button
  // has scrolled out of view. Avoids crowding the viewport on first load.
  useEffect(() => {
    const node = ctaRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCta(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -10% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [product]);

  // Lock body scroll while either modal is open.
  useEffect(() => {
    if (sizeGuideOpen || lightboxOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sizeGuideOpen, lightboxOpen]);

  const navigateLightbox = (delta) => {
    if (!gallery || gallery.length === 0) return;
    const next = (activeImage + delta + gallery.length) % gallery.length;
    setActiveImage(next);
  };

  const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;
  const hasColors = Array.isArray(product?.colors) && product.colors.length > 0;
  const isOutOfStock = product?.stock === 0;

  const handleAddToCart = async () => {
    if (!product || isOutOfStock || adding) return;
    if (hasSizes && selectedSize == null) {
      setSizeError('Please select a size before adding to your bag.');
      setActionMessage('');
      return;
    }
    setSizeError('');
    setAdding(true);
    setActionMessage('');
    const size = hasSizes ? selectedSize : undefined;
    const color = hasColors ? selectedColor : undefined;
    try {
      await addToCart(product.id, quantity, {
        size,
        color,
        snapshot: {
          name: product.name,
          brand: product.brand,
          price: product.price,
          imageUrl: gallery[0] || product.imageUrl,
          images: product.images,
          categoryId: product.categoryId,
          categoryName: product.categoryName || product.category,
          stock: product.stock
        }
      });
      showAddedToBag({
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        unitPrice: product.price,
        imageUrl: gallery[0] || product.imageUrl,
        images: product.images,
        categoryId: product.categoryId,
        categoryName: product.categoryName || product.category,
        quantity,
        size,
        color
      });
    } catch (apiError) {
      setActionMessage(apiError.message || 'Unable to add to cart.');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product || savingWishlist || !isAuthenticated) return;
    setSavingWishlist(true);
    setActionMessage('');
    try {
      const result = await toggleWishlist(product.id);
      if (result.ok) {
        setActionMessage(result.isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
      } else if (result.error) {
        const msg = result.error.message || 'Unable to update wishlist.';
        setActionMessage(msg);
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <ProductDetailSkeleton />
      </Container>
    );
  }

  const onWishlist = product ? isInWishlist(product.id) : false;

  if (error || !product) {
    return (
      <Container>
        <EmptyState
          title="Product not available"
          description={error || 'This product could not be found.'}
          action={
            <Button to="/products" variant="primary">
              Browse catalog
            </Button>
          }
        />
      </Container>
    );
  }

  return (
    <Container>
      <nav className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-ink-400">
        <Link to="/" className="hover:text-ink-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-ink-700">Shop</Link>
        <span>/</span>
        {product.categoryName ? (
          <>
            <Link
              to={`/products?category=${encodeURIComponent(product.categoryName)}`}
              className="hover:text-ink-700"
            >
              {product.categoryName}
            </Link>
            <span>/</span>
          </>
        ) : null}
        <span className="text-ink-700 dark:text-ink-300">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
        <ProductGallery
          images={gallery}
          activeIndex={activeImage}
          onSelect={setActiveImage}
          onOpenLightbox={() => setLightboxOpen(true)}
          alt={product.name}
        />

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {product.categoryName ? (
              <Badge variant="outline">{product.categoryName}</Badge>
            ) : null}
            {isOutOfStock ? <Badge variant="danger">Out of stock</Badge> : null}
            {!isOutOfStock && product.stock <= 5 ? (
              <Badge variant="warning">Only {product.stock} left</Badge>
            ) : null}
          </div>

          {product.brand ? (
            <p className="text-2xs font-semibold uppercase tracking-[0.3em] text-accent-600">
              {product.brand}
            </p>
          ) : null}

          <h1 className="font-display text-4xl font-bold tracking-tight text-ink-950 dark:text-ink-50 sm:text-5xl">
            {product.name}
          </h1>

          <div className="flex items-center gap-3">
            <Rating value={product.rating || 0} showValue size="md" />
            <span className="text-sm text-ink-500 dark:text-ink-400">
              ({reviews.length} review{reviews.length === 1 ? '' : 's'})
            </span>
          </div>

          <p className="font-display text-3xl font-bold text-ink-950 dark:text-ink-50">
            {formatCurrency(product.price)}
          </p>

          <p className="text-base leading-relaxed text-ink-600 dark:text-ink-300">{product.description}</p>

          {hasColors ? (
            <ColorSelector
              colors={product.colors}
              selected={selectedColor}
              onSelect={setSelectedColor}
            />
          ) : null}

          {hasSizes ? (
            <SizeSelector
              sizes={product.sizes}
              selected={selectedSize}
              onSelect={(size) => {
                setSelectedSize(size);
                setSizeError('');
              }}
              onOpenSizeGuide={() => setSizeGuideOpen(true)}
              error={sizeError}
            />
          ) : null}

          <div className="space-y-4 rounded-2xl border border-ink-100 bg-white p-5 dark:border-ink-800 dark:bg-ink-900">
            <div className="flex items-center gap-3">
              <span className="text-2xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                Quantity
              </span>
              <QuantityStepper
                value={quantity}
                min={1}
                max={Math.max(1, product.stock || 1)}
                onChange={setQuantity}
              />
            </div>

            <div ref={ctaRef} className="flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleAddToCart}
                size="lg"
                variant="accent"
                fullWidth
                disabled={isOutOfStock || adding}
              >
                {isOutOfStock ? 'Sold out' : adding ? 'Adding...' : 'Add to bag'}
              </Button>
              <Button
                onClick={handleWishlistToggle}
                size="lg"
                variant="outline"
                fullWidth
                className={onWishlist ? 'border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50' : ''}
                leftIcon={<IconHeart className="h-4 w-4" filled={onWishlist} />}
                disabled={!isAuthenticated || savingWishlist}
              >
                {isAuthenticated
                  ? savingWishlist
                    ? 'Saving...'
                    : onWishlist
                      ? 'Saved to wishlist'
                      : 'Save to wishlist'
                  : 'Sign in to save'}
              </Button>
            </div>
            {actionMessage ? (
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{actionMessage}</p>
            ) : null}
          </div>

          <ul className="grid gap-3 text-sm text-ink-600 dark:text-ink-300 sm:grid-cols-3">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item.text}
                className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-3 dark:border-ink-800 dark:bg-ink-900"
              >
                <span className="text-ink-900 dark:text-ink-100">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mt-20">
        <div className="border-b border-ink-100 dark:border-ink-800">
          <div className="flex gap-6 overflow-x-auto scrollbar-none">
            {detailTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={classNames(
                  'border-b-2 pb-4 text-sm font-semibold uppercase tracking-wider transition',
                  activeTab === tab.key
                    ? 'border-ink-950 text-ink-950 dark:border-white dark:text-white'
                    : 'border-transparent text-ink-400 hover:text-ink-700 dark:text-ink-500 dark:hover:text-ink-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8">
          {activeTab === 'description' ? (
            <div className="grid max-w-4xl gap-4 text-ink-600 dark:text-ink-300">
              <p>{product.description}</p>
              <ul className="grid gap-2 text-sm sm:grid-cols-2">
                {product.brand ? (
                  <li className="rounded-xl bg-white p-3 shadow-soft dark:bg-ink-900 dark:shadow-none">
                    <span className="font-semibold text-ink-900 dark:text-ink-100">Brand</span>
                    <p className="text-ink-500 dark:text-ink-400">{product.brand}</p>
                  </li>
                ) : null}
                <li className="rounded-xl bg-white p-3 shadow-soft dark:bg-ink-900 dark:shadow-none">
                  <span className="font-semibold text-ink-900 dark:text-ink-100">Category</span>
                  <p className="text-ink-500 dark:text-ink-400">{product.categoryName || '—'}</p>
                </li>
                {hasSizes ? (
                  <li className="rounded-xl bg-white p-3 shadow-soft dark:bg-ink-900 dark:shadow-none">
                    <span className="font-semibold text-ink-900 dark:text-ink-100">Sizes (EU)</span>
                    <p className="text-ink-500 dark:text-ink-400">{product.sizes.join(', ')}</p>
                  </li>
                ) : null}
                {hasColors ? (
                  <li className="rounded-xl bg-white p-3 shadow-soft dark:bg-ink-900 dark:shadow-none">
                    <span className="font-semibold text-ink-900 dark:text-ink-100">Colourways</span>
                    <p className="text-ink-500 dark:text-ink-400">{product.colors.join(', ')}</p>
                  </li>
                ) : null}
                <li className="rounded-xl bg-white p-3 shadow-soft dark:bg-ink-900 dark:shadow-none">
                  <span className="font-semibold text-ink-900 dark:text-ink-100">Stock</span>
                  <p className="text-ink-500 dark:text-ink-400">{product.stock} available</p>
                </li>
                <li className="rounded-xl bg-white p-3 shadow-soft dark:bg-ink-900 dark:shadow-none">
                  <span className="font-semibold text-ink-900 dark:text-ink-100">SKU</span>
                  <p className="text-ink-500 dark:text-ink-400">SH-{product.id}</p>
                </li>
                <li className="rounded-xl bg-white p-3 shadow-soft dark:bg-ink-900 dark:shadow-none">
                  <span className="font-semibold text-ink-900 dark:text-ink-100">Rating</span>
                  <p className="text-ink-500 dark:text-ink-400">{Number(product.rating || 0).toFixed(1)} / 5</p>
                </li>
              </ul>
            </div>
          ) : null}

          {activeTab === 'reviews' ? (
            <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr]">
              <div className="space-y-4">
                <div className="card-base p-6">
                  <p className="text-2xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
                    Average rating
                  </p>
                  <p className="mt-2 font-display text-4xl font-bold text-ink-950 dark:text-ink-50">
                    {Number(product.rating || 0).toFixed(1)}
                  </p>
                  <Rating value={product.rating || 0} size="md" />
                  <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">
                    Based on {reviews.length} review{reviews.length === 1 ? '' : 's'}
                  </p>
                </div>

                <form
                  className="card-base space-y-3 p-6"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    if (reviewBusy) return;
                    setReviewBusy(true);
                    setReviewError('');
                    setSubmitMessage('');
                    try {
                      await createReview(
                        {
                          productId: product.id,
                          rating: Number(reviewForm.rating),
                          comment: reviewForm.comment.trim()
                        },
                        authState
                      );
                      try {
                        const latest = await fetchReviews(product.id);
                        setReviews(Array.isArray(latest) ? latest : []);
                      } catch {
                        /* keep existing list if refresh fails in strict API mode */
                      }
                      setReviewForm({ rating: 5, comment: '' });
                      setSubmitMessage('Thanks for your review!');
                    } catch (apiError) {
                      setReviewError(apiError.message || 'Unable to submit review.');
                    } finally {
                      setReviewBusy(false);
                    }
                  }}
                >
                  <h3 className="font-display text-lg font-semibold text-ink-950 dark:text-ink-50">Write a review</h3>
                  <label className="block">
                    <span className="label-base">Your rating</span>
                    <select
                      className="input-base"
                      value={reviewForm.rating}
                      onChange={(event) =>
                        setReviewForm((prev) => ({ ...prev, rating: event.target.value }))
                      }
                    >
                      {[5, 4, 3, 2, 1].map((score) => (
                        <option key={score} value={score}>
                          {score} {score === 1 ? 'star' : 'stars'}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="label-base">Comment</span>
                    <textarea
                      className="input-base h-24 resize-none"
                      placeholder="Share your experience"
                      value={reviewForm.comment}
                      onChange={(event) =>
                        setReviewForm((prev) => ({ ...prev, comment: event.target.value }))
                      }
                      required
                    />
                  </label>
                  {reviewError ? (
                    <p className="text-sm text-rose-600 dark:text-rose-400">{reviewError}</p>
                  ) : null}
                  {submitMessage ? (
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">{submitMessage}</p>
                  ) : null}
                  <Button type="submit" variant="primary" disabled={reviewBusy} fullWidth>
                    {reviewBusy ? 'Submitting...' : 'Submit review'}
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <EmptyState
                    title="No reviews yet"
                    description="Be the first to share what you think."
                  />
                ) : (
                  reviews.map((review) => (
                    <article key={review.id} className="card-base p-5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-ink-900 dark:text-ink-100">{review.reviewerEmail}</p>
                        <Rating value={review.rating} />
                      </div>
                      <p className="mt-2 text-sm text-ink-600 dark:text-ink-300">{review.comment}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {activeTab === 'shipping' ? (
            <div className="grid gap-4 text-ink-600 dark:text-ink-300 lg:grid-cols-2">
              <div className="card-base p-6">
                <h4 className="font-semibold text-ink-900 dark:text-ink-100">Shipping</h4>
                <p className="mt-2 text-sm">
                  Free standard shipping on orders over $75. Express options available at checkout.
                </p>
              </div>
              <div className="card-base p-6">
                <h4 className="font-semibold text-ink-900 dark:text-ink-100">Returns</h4>
                <p className="mt-2 text-sm">
                  Not the right fit? Return any unused item within 30 days for a full refund.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {personalizedAds ? (
        <ProductRail
          eyebrow="Complete the look"
          title="You may also like"
          products={related}
        />
      ) : (
        <section className="mt-12 border-t border-ink-100 pt-10 dark:border-ink-800">
          <Container>
            <p className="text-center text-sm text-ink-600 dark:text-ink-400">
              Personalized recommendations are turned off in your{' '}
              <Link to="/settings" className="font-semibold text-ink-900 underline-offset-2 hover:underline dark:text-ink-200">
                privacy settings
              </Link>
              .
            </p>
          </Container>
        </section>
      )}

      {dataSharing && recentlyViewed.length > 0 ? (
        <ProductRail
          eyebrow="Recently viewed"
          title="Pick up where you left off"
          products={recentlyViewed}
        />
      ) : null}

      <section className="mt-12 flex items-center justify-center pb-24 lg:pb-0">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-700 hover:text-accent-600 dark:text-ink-300 dark:hover:text-accent-400"
        >
          Continue shopping <IconArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <SizeGuideModal
        open={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        availableEuSizes={hasSizes ? product.sizes : []}
      />

      <ImageLightbox
        open={lightboxOpen}
        images={gallery}
        activeIndex={activeImage}
        onClose={() => setLightboxOpen(false)}
        onNavigate={navigateLightbox}
      />

      <StickyMobileCTA
        visible={showStickyCta && !lightboxOpen && !sizeGuideOpen}
        product={product}
        onAddToCart={handleAddToCart}
        adding={adding}
        disabled={isOutOfStock}
        helperText={sizeError}
      />
    </Container>
  );
}

function ProductGallery({ images, activeIndex, onSelect, onOpenLightbox, alt }) {
  const safeImages = useMemo(
    () => (images && images.length > 0 ? images : [IMAGE_PLACEHOLDER]),
    [images]
  );
  const containerRef = useRef(null);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);

  const handleMove = (event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[7rem_1fr] lg:gap-6">
      <div className="order-2 flex gap-3 overflow-x-auto pb-1 lg:order-1 lg:flex-col lg:overflow-y-auto lg:pb-0">
        {safeImages.map((url, index) => (
          <button
            key={url + index}
            type="button"
            onClick={() => onSelect(index)}
            className={classNames(
              'group/thumb relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition sm:h-24 sm:w-24 lg:h-28 lg:w-28',
              index === activeIndex
                ? 'border-ink-950 ring-2 ring-ink-950/10 dark:border-white dark:ring-white/20'
                : 'border-transparent hover:border-ink-200 dark:hover:border-ink-600'
            )}
            aria-label={`View image ${index + 1}`}
          >
            <img
              src={url}
              alt=""
              className="h-full w-full object-cover object-center transition duration-500 ease-out group-hover/thumb:scale-110"
            />
          </button>
        ))}
      </div>
      <div
        ref={containerRef}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMove}
        className="order-1 relative aspect-square min-h-[280px] overflow-hidden rounded-3xl bg-ink-50 shadow-card dark:bg-ink-900 sm:min-h-[360px] lg:order-2 lg:min-h-[420px]"
      >
        <button
          type="button"
          onClick={onOpenLightbox}
          aria-label="Open image viewer"
          className="absolute inset-0 z-10 cursor-zoom-in"
        />
        <img
          src={safeImages[activeIndex] || safeImages[0]}
          alt={alt}
          fetchPriority={activeIndex === 0 ? 'high' : undefined}
          className="h-full w-full object-cover transition-transform duration-300 ease-out"
          style={{
            transform: zooming ? 'scale(1.6)' : 'scale(1)',
            transformOrigin: `${origin.x}% ${origin.y}%`
          }}
        />
        {onOpenLightbox ? (
          <button
            type="button"
            onClick={onOpenLightbox}
            aria-label="Open full-screen image viewer"
            className="pointer-events-auto absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-ink-700 shadow-soft backdrop-blur transition hover:bg-white hover:text-ink-950 dark:bg-ink-950/85 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-white"
          >
            <IconZoomIn className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SizeSelector({ sizes, selected, onSelect, onOpenSizeGuide, error }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-2xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
          Select size (EU)
        </span>
        <button
          type="button"
          onClick={onOpenSizeGuide}
          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 underline-offset-2 hover:text-ink-900 hover:underline dark:text-ink-400 dark:hover:text-ink-100"
        >
          <IconRuler className="h-4 w-4" />
          Size guide
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isActive = selected === size;
          return (
            <button
              key={size}
              type="button"
              onClick={() => onSelect(size)}
              aria-pressed={isActive}
              className={classNames(
                'inline-flex h-12 min-w-[3.25rem] items-center justify-center rounded-xl border px-3 text-sm font-semibold transition',
                isActive
                  ? 'border-ink-950 bg-ink-950 text-white shadow-soft dark:border-white dark:bg-white dark:text-ink-950'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900 hover:text-ink-950 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-ink-500 dark:hover:text-white'
              )}
            >
              {size}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ColorSelector({ colors, selected, onSelect }) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline gap-2">
        <span className="text-2xs font-semibold uppercase tracking-widest text-ink-500 dark:text-ink-400">
          Colour
        </span>
        {selected ? (
          <span className="text-sm font-medium text-ink-700 dark:text-ink-300">{selected}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isActive = selected === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelect(color)}
              aria-pressed={isActive}
              className={classNames(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition',
                isActive
                  ? 'border-ink-950 bg-ink-950 text-white dark:border-white dark:bg-white dark:text-ink-950'
                  : 'border-ink-200 bg-white text-ink-700 hover:border-ink-900 hover:text-ink-950 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:border-ink-500 dark:hover:text-white'
              )}
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 rounded-full border border-white/40"
                style={{ background: colorToCss(color) }}
              />
              {color}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const COLOR_KEYWORDS = [
  ['white', '#f8fafc'],
  ['cloud', '#e5e7eb'],
  ['silver', '#d4d4d8'],
  ['black', '#0f172a'],
  ['onix', '#1f2937'],
  ['anthracite', '#1f2937'],
  ['navy', '#1e3a8a'],
  ['royal', '#1d4ed8'],
  ['blue', '#2563eb'],
  ['sapphire', '#1e40af'],
  ['mint', '#5eead4'],
  ['teal', '#14b8a6'],
  ['green', '#16a34a'],
  ['lemon', '#facc15'],
  ['volt', '#bef264'],
  ['yellow', '#facc15'],
  ['gold', '#d4a017'],
  ['orange', '#f97316'],
  ['mahogany', '#7c2d12'],
  ['red', '#dc2626'],
  ['crimson', '#b91c1c'],
  ['solar', '#ef4444'],
  ['pink', '#ec4899'],
  ['purple', '#9333ea'],
  ['ink', '#0f172a'],
  ['chrome', '#9ca3af']
];

function colorToCss(label) {
  if (!label) return '#94a3b8';
  const tokens = String(label).toLowerCase().split(/[\s/]+/).filter(Boolean);
  const matches = tokens
    .map((token) => COLOR_KEYWORDS.find(([key]) => token.includes(key)))
    .filter(Boolean)
    .slice(0, 2);
  if (matches.length === 0) return '#94a3b8';
  if (matches.length === 1) return matches[0][1];
  return `linear-gradient(135deg, ${matches[0][1]} 0%, ${matches[0][1]} 50%, ${matches[1][1]} 50%, ${matches[1][1]} 100%)`;
}

function QuantityStepper({ value, min = 1, max = 99, onChange }) {
  const update = (next) => {
    const bounded = Math.max(min, Math.min(max, next));
    onChange(bounded);
  };
  return (
    <div className="inline-flex items-center rounded-full border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-950">
      <button
        type="button"
        onClick={() => update(value - 1)}
        disabled={value <= min}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition hover:text-ink-950 disabled:opacity-40 dark:text-ink-300 dark:hover:text-white"
        aria-label="Decrease quantity"
      >
        <IconMinus className="h-4 w-4" />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold text-ink-900 dark:text-ink-100">{value}</span>
      <button
        type="button"
        onClick={() => update(value + 1)}
        disabled={value >= max}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink-700 transition hover:text-ink-950 disabled:opacity-40 dark:text-ink-300 dark:hover:text-white"
        aria-label="Increase quantity"
      >
        <IconPlus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default ProductDetailPage;
