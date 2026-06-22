import { useState } from "react";

interface Props {
  name: string;
  domain?: string;
  fallbackUrl?: string;
  size?: number;
  className?: string;
}

function domainFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

export function CompanyLogo({
  name,
  domain,
  fallbackUrl,
  size = 48,
  className = "",
}: Props) {
  const key = (import.meta as any).env?.VITE_LOGO_DEV_PUBLISHABLE_KEY as
    | string
    | undefined;
  const resolvedDomain = domain || domainFromUrl(fallbackUrl);
  const primary =
    key && resolvedDomain
      ? `https://img.logo.dev/${resolvedDomain}?token=${key}&size=${size * 2}`
      : fallbackUrl;

  const [src, setSrc] = useState<string | undefined>(primary);
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    const initial = (name?.[0] || "?").toUpperCase();
    return (
      <div
        className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 font-heading font-semibold text-slate-600 ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
        aria-label={`${name} logo placeholder`}
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      width={size}
      height={size}
      className={`rounded-xl object-contain bg-white ${className}`}
      onError={() => {
        if (src !== fallbackUrl && fallbackUrl) {
          setSrc(fallbackUrl);
        } else {
          setErrored(true);
        }
      }}
    />
  );
}
