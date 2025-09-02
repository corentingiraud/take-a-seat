"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import { HCAPTCHA_SITE_KEY } from "@/config/site";

type Props = {
  className?: string;
  onChange?: (token: string | null) => void; // returns token when solved, null when cleared/expired
  /** Optional hard override; if omitted, uses current app theme */
  theme?: "light" | "dark";
  size?: "normal" | "compact"; // explicit override
  /** When true, switch to "compact" on small screens unless size="normal" is explicitly forced */
  autoCompact?: boolean;
  /** Pixel width under which "compact" is used when autoCompact is true */
  autoCompactBreakpoint?: number;
};

export function HCaptchaWidget({
  className,
  onChange,
  size = "normal",
  autoCompact = true,
  autoCompactBreakpoint = 450,
}: Props) {
  const captchaRef = useRef<HCaptcha | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isNarrow, setIsNarrow] = useState(false);
  const [mounted, setMounted] = useState(false);

  const sitekey = HCAPTCHA_SITE_KEY;

  // next-themes resolves actual theme client-side; guard to avoid hydration mismatch
  const { resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (typeof window === "undefined" || !autoCompact) return;

    const mq = window.matchMedia(`(max-width: ${autoCompactBreakpoint}px)`);
    const update = () => setIsNarrow(mq.matches);

    update(); // run once
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, [autoCompact, autoCompactBreakpoint]);

  // Decide final size: explicit "compact" always wins.
  const effectiveSize: "normal" | "compact" =
    size === "compact"
      ? "compact"
      : autoCompact && isNarrow
        ? "compact"
        : "normal";

  // hCaptcha accepts only "light" | "dark"
  const effectiveTheme: "light" | "dark" = useMemo(() => {
    return resolvedTheme === "dark" ? "dark" : "light";
  }, [resolvedTheme]);

  // Force remount when theme/size change so the iframe restyles correctly
  const widgetKey = `${effectiveTheme}-${effectiveSize}`;

  if (!sitekey) {
    console.warn(
      "HCaptchaWidget: Missing NEXT_PUBLIC_HCAPTCHA_SITEKEY. Add it to .env.local",
    );
  }

  const handleVerify = useCallback(
    (token: string) => {
      setError(null);
      onChange?.(token);
    },
    [onChange],
  );

  const handleExpire = useCallback(() => {
    onChange?.(null);
  }, [onChange]);

  const handleError = useCallback(
    (e: string) => {
      setError("Le captcha n’a pas pu se charger. Réessaie.");
      onChange?.(null);
      console.error("hCaptcha error:", e);
    },
    [onChange],
  );

  // Avoid rendering before next-themes resolves to prevent mismatch flash
  if (!mounted) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="h-20 w-[302px] max-w-full rounded-md border border-border" />
        <p className="sr-only">Captcha loading…</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <HCaptcha
        key={widgetKey}
        ref={captchaRef as any}
        sitekey={sitekey ?? ""}
        size={effectiveSize}
        theme={effectiveTheme}
        onError={handleError}
        onExpire={handleExpire}
        onVerify={handleVerify}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <noscript>
        <p className="text-xs text-muted-foreground">
          Active JavaScript pour utiliser le captcha.
        </p>
      </noscript>
    </div>
  );
}

export default HCaptchaWidget;
