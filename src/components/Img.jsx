import { useState } from 'react';

/**
 * Image with a graceful, on-brand fallback.
 *
 * Remote artwork can fail (offline previews, blocked hosts), so a failed load
 * degrades into a warm coffee-toned panel that keeps the layout and mood intact
 * instead of showing a broken-image icon.
 */
export default function Img({ src, alt, className = '', style, loading = 'lazy', sizes, children }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`img-fallback ${className}`} style={style} role="img" aria-label={alt}>
        <span>{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding="async"
      sizes={sizes}
      onError={() => setFailed(true)}
    />
  );
}
