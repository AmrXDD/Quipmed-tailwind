import { Link } from "react-router-dom";
import { openConsentSettings, useConsent } from "@/lib/consent";
import LegalLayout, { type LegalSection } from "./LegalLayout";

const STORED = [
  {
    name: "quipmed.consent.v1",
    where: "Local storage",
    purpose: "Remembers your cookie choice so we don't ask on every visit.",
    duration: "12 months",
    type: "Essential",
  },
  {
    name: "quipmed.cart.v1",
    where: "Local storage",
    purpose: "Keeps the products in your quote list.",
    duration: "Until you clear it",
    type: "Essential",
  },
  {
    name: "theme",
    where: "Local storage",
    purpose: "Remembers whether you chose the light or dark theme.",
    duration: "Until you clear it",
    type: "Essential",
  },
  {
    name: "quipmed.preloaded",
    where: "Session storage",
    purpose: "Shortens the loading screen after your first page in a visit.",
    duration: "Until you close the tab",
    type: "Essential",
  },
  {
    name: "sb-…-auth-token",
    where: "Local storage",
    purpose: "Keeps QuipMed staff signed in to the admin area. Not set for visitors.",
    duration: "Until sign-out",
    type: "Essential",
  },
  {
    name: "Google cookies (e.g. NID)",
    where: "Cookies on google.com",
    purpose: "Set by Google Maps when the embedded map on the contact page loads.",
    duration: "Set by Google",
    type: "Embedded content (only with your consent)",
  },
];

export default function Cookies() {
  const { decided, embedsAllowed } = useConsent();

  const sections: LegalSection[] = [
    {
      id: "summary",
      title: "In short",
      body: (
        <ul>
          <li>We do not use advertising, analytics or tracking cookies.</li>
          <li>
            The site stores a few small items in your browser that it needs to work. These
            don&rsquo;t identify you and never leave your device.
          </li>
          <li>Embedded Google Maps sets its own cookies, so it only loads if you allow it.</li>
        </ul>
      ),
    },
    {
      id: "what-we-store",
      title: "What is stored",
      body: (
        <div className="-mx-1 overflow-x-auto px-1">
          <table>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Purpose</th>
                <th scope="col">Duration</th>
                <th scope="col">Type</th>
              </tr>
            </thead>
            <tbody>
              {STORED.map((r) => (
                <tr key={r.name}>
                  <td>
                    <code>{r.name}</code>
                    <div className="mt-1 text-xs text-slate-mid">{r.where}</div>
                  </td>
                  <td>{r.purpose}</td>
                  <td className="whitespace-nowrap">{r.duration}</td>
                  <td>{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "your-choice",
      title: "Your choice",
      body: (
        <>
          <p>
            Your current setting:{" "}
            <strong>
              {!decided
                ? "not chosen yet"
                : embedsAllowed
                  ? "embedded content allowed"
                  : "essential only"}
            </strong>
            .
          </p>
          <p>
            <button
              type="button"
              onClick={openConsentSettings}
              className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/[0.06]"
            >
              Change cookie settings
            </button>
          </p>
          <p>
            You can also clear or block site storage in your browser settings. Essential storage
            is needed for the quote list and theme to work. If you block it, those features
            will reset on each visit.
          </p>
        </>
      ),
    },
    {
      id: "more",
      title: "More information",
      body: (
        <p>
          For how we handle personal information in general, see our{" "}
          <Link to="/privacy">privacy policy</Link>. For Google&rsquo;s use of cookies, see{" "}
          <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer">
            Google&rsquo;s cookie policy
          </a>
          .
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      current="/cookies"
      eyebrow="Legal"
      title="Cookie policy"
      intro={<p>Exactly what this website stores on your device, and why.</p>}
      sections={sections}
    />
  );
}
