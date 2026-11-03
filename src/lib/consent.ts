import { useEffect, useState } from "react";

/**
 * Cookie / storage consent.
 *
 * The site itself only uses strictly necessary local storage (quote list,
 * theme, this consent record, staff sign-in). The one optional category is
 * "embeds": third-party content that sets its own cookies (Google Maps).
 * Nothing optional loads until the visitor allows it.
 */

export const CONSENT_KEY = "quipmed.consent.v1";
export const CONSENT_VERSION = 1;
/** Ask again after 12 months. */
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

export type Consent = {
  v: number;
  embeds: boolean;
  at: string; // ISO timestamp of the decision
};

const EVENT = "quipmed:consent";
const OPEN_EVENT = "quipmed:consent-open";

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as Consent;
    if (c.v !== CONSENT_VERSION) return null;
    if (Date.now() - new Date(c.at).getTime() > MAX_AGE_MS) return null;
    return c;
  } catch {
    return null;
  }
}

export function saveConsent(embeds: boolean) {
  const c: Consent = { v: CONSENT_VERSION, embeds, at: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
  } catch {
    /* storage blocked — choice still applies for this page view */
  }
  window.dispatchEvent(new CustomEvent<Consent>(EVENT, { detail: c }));
}

/** Re-open the consent banner (footer "Cookie settings" link). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function useConsent() {
  const [consent, setConsent] = useState<Consent | null>(() => readConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const onChange = (e: Event) => {
      setConsent((e as CustomEvent<Consent>).detail);
      setSettingsOpen(false);
    };
    const onOpen = () => setSettingsOpen(true);
    window.addEventListener(EVENT, onChange);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener(EVENT, onChange);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  return {
    consent,
    /** True once the visitor has made a choice. */
    decided: consent !== null,
    embedsAllowed: consent?.embeds === true,
    settingsOpen,
  };
}
