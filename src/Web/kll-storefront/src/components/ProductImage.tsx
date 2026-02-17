import { useState, useEffect } from "react";

interface ProductImageProps {
  imageUrl?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

function resolveImageSrc(url: string): { local: string | null; remote: string | null } {
  // Local paths (e.g. /categories/aneis.jpg, /products/foo.jpg) — use directly
  if (url.startsWith("/")) return { local: url, remote: null };
  // B2/remote URLs — extract filename for local fallback
  const match = url.match(/products\/(.+)$/);
  return { local: match ? `/products/${match[1]}` : null, remote: url };
}

export default function ProductImage({ imageUrl, alt, className, style }: ProductImageProps) {
  const resolved = imageUrl ? resolveImageSrc(imageUrl) : null;
  const initialSrc = resolved?.local ?? resolved?.remote ?? null;

  const [src, setSrc] = useState<string | null>(initialSrc);
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    const r = imageUrl ? resolveImageSrc(imageUrl) : null;
    setSrc(r?.local ?? r?.remote ?? null);
    setErrorCount(0);
  }, [imageUrl]);

  const handleError = () => {
    if (errorCount === 0 && resolved?.remote) {
      // Local failed, try remote original
      setSrc(resolved.remote);
      setErrorCount(1);
    } else {
      // Both failed, show placeholder
      setSrc(null);
      setErrorCount(2);
    }
  };

  if (!src) {
    return (
      <div
        className={className}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #1a1a2e, #0f0f1a)",
          ...style,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,98,0.15)" strokeWidth="1">
          <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
    />
  );
}
