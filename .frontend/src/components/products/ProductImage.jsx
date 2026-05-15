import { useEffect, useState } from 'react';
import { IMAGE_PLACEHOLDER, IMAGE_PLACEHOLDER_INLINE, resolveProductImage } from '../../utils/firebaseStorage';
import { classNames } from '../../utils/format';

/**
 * ProductImage
 * - Resolves Firebase Storage paths or absolute URLs (see firebaseStorage.js).
 * - Falls back to a curated category image when the source is missing.
 * - Falls back to an inline SVG placeholder if even the remote image fails.
 */
function ProductImage({
  product,
  index = 0,
  alt,
  src: srcOverride,
  className = '',
  imageClassName = '',
  zoom = false,
  rounded = 'rounded-2xl',
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px'
}) {
  const initialSrc = srcOverride || resolveProductImage(product, { index });
  const [src, setSrc] = useState(initialSrc);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(initialSrc);
    setLoaded(false);
  }, [initialSrc]);

  // Try /images/placeholder-product.svg first, then inline SVG so load always succeeds.
  const handleError = () => {
    if (src === IMAGE_PLACEHOLDER) {
      setSrc(IMAGE_PLACEHOLDER_INLINE);
    } else if (src !== IMAGE_PLACEHOLDER_INLINE) {
      setSrc(IMAGE_PLACEHOLDER);
    }
    setLoaded(true);
  };

  return (
    <div className={classNames('relative overflow-hidden bg-ink-100', rounded, className)}>
      {!loaded ? <div className="absolute inset-0 skeleton" aria-hidden="true" /> : null}
      <img
        src={src}
        alt={alt || product?.name || 'Product image'}
        loading="lazy"
        decoding="async"
        sizes={sizes}
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={classNames(
          'h-full w-full object-cover object-center transition duration-700 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
          zoom ? 'group-hover:scale-110' : '',
          imageClassName
        )}
      />
    </div>
  );
}

export default ProductImage;
