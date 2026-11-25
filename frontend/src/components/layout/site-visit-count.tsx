"use client";

import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../../lib/api";

const VISIT_COUNTED_KEY = "kalpbhumi.homepage-visit-counted.v1";

async function requestVisitCount(recordVisit: boolean): Promise<number> {
  let payload: unknown;
  const alreadyCounted = recordVisit && window.localStorage.getItem(VISIT_COUNTED_KEY) === "1";
  if (recordVisit && !alreadyCounted) {
    window.localStorage.setItem(VISIT_COUNTED_KEY, "1");
    try {
      const response = await apiPost("/visits/", {});
      if (!response.ok) throw new Error(`Visit counter request failed (${response.status})`);
      payload = await response.json();
    } catch (error) {
      window.localStorage.removeItem(VISIT_COUNTED_KEY);
      throw error;
    }
  } else {
    payload = await apiGet<unknown>("/visits/");
  }

  if (typeof payload !== "object" || payload === null || !("total_visits" in payload)) {
    throw new Error("Visit counter response is invalid");
  }
  const total = payload.total_visits;
  if (typeof total !== "number" || !Number.isSafeInteger(total) || total < 0) {
    throw new Error("Visit counter response is invalid");
  }
  return total;
}

export function SiteVisitCount({ recordVisit }: { recordVisit: boolean }) {
  const request = useRef<Promise<number> | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    request.current ??= requestVisitCount(recordVisit);
    request.current.then(
      (count) => { if (active) setTotal(count); },
      (error: unknown) => {
        console.error("Could not load the website visit count", error);
        if (active) setUnavailable(true);
      },
    );
    return () => { active = false; };
  }, [recordVisit]);

  return <b aria-live="polite">{total === null ? (unavailable ? "Unavailable" : "Loading…") : total.toLocaleString("en-IN")}</b>;
}
