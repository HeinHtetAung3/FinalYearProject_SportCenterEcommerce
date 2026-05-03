import { useEffect, useState } from 'react';
import { IMAGE_PLACEHOLDER, resolveProductImage } from '../../utils/firebaseStorage';
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
  rounded = 'rounded-2xl'
}) {
  const initialSrc = srcOverride || resolveProductImage(product, { index });
  const [src, setSrc] = useState(initialSrc);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSrc(initialSrc);
    setLoaded(false);
  }, [initialSrc]);

  // Hard fallback: if the resolved URL (Firebase, category placeholder,
  // etc.) ever 404s we swap to the inline SVG placeholder. The
  // placeholder is a data: URI so it can never fail to load and we
  // also flip `loaded` so the skeleton doesn't sit on top of it.
  // Guarding on `src !== IMAGE_PLACEHOLDER` avoids any chance of an
  // infinite onError loop.
  const handleError = () => {
    if (src !== IMAGE_PLACEHOLDER) {
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
        onLoad={() => setLoaded(true)}
        onError={handleError}
        className={classNames(
          'h-full w-full object-cover transition duration-700 ease-out',
          loaded ? 'opacity-100' : 'opacity-0',
          zoom ? 'group-hover:scale-110' : '',
          imageClassName
        )}
      />
    </div>
  );
}

export default ProductImage;
