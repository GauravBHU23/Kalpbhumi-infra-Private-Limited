"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onVerified: (token: string) => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function BotCheck({ onVerified }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const host = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!siteKey) return;
    const renderWidget = () => {
      if (!host.current || !window.turnstile) return;
      widget.current = window.turnstile.render(host.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerified(token),
        "expired-callback": () => onVerified(""),
        "error-callback": () => onVerified(""),
        theme: "light",
      });
    };
    const existing = document.getElementById("turnstile-script") as HTMLScriptElement | null;
    if (existing) {
      if (window.turnstile) renderWidget();
      else existing.addEventListener("load", renderWidget, { once: true });
    } else {
      const script = document.createElement("script");
      script.id = "turnstile-script";
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.addEventListener("load", renderWidget, { once: true });
      document.head.appendChild(script);
    }
    return () => {
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
    };
  }, [siteKey, onVerified]);

  if (siteKey) {
    return (
      <div className="bot-check">
        <div ref={host} />
      </div>
    );
  }

  return (
    <label className="bot-check bot-check-fallback">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => {
          setChecked(event.target.checked);
          onVerified(event.target.checked ? "local-human-check" : "");
        }}
      />
      <span>I&apos;m not a robot</span>
    </label>
  );
}
