import { Link } from "react-router-dom";
import { useCompanyInfo } from "@/hooks/useSupabase";
import LegalLayout, { type LegalSection } from "./LegalLayout";

export default function Terms() {
  const c = useCompanyInfo();

  const sections: LegalSection[] = [
    {
      id: "about",
      title: "About these terms",
      body: (
        <p>
          These terms apply to your use of <strong>{c.website}</strong>, operated by {c.name} (
          {c.name_ar}), {c.address}. By using the site you agree to them. If you don&rsquo;t
          agree, please don&rsquo;t use the site.
        </p>
      ),
    },
    {
      id: "audience",
      title: "Professional use and no medical advice",
      body: (
        <>
          <p>
            This site is intended for healthcare professionals, healthcare facilities and
            procurement teams. Nothing on it is medical advice, a diagnosis or a recommendation
            for any patient.
          </p>
          <p>
            Medical equipment must be selected, installed and operated by qualified personnel in
            line with the manufacturer&rsquo;s instructions for use and applicable regulations.
          </p>
        </>
      ),
    },
    {
      id: "product-information",
      title: "Product information",
      body: (
        <>
          <p>
            Product descriptions, specifications and images are provided for general information.
            They come from manufacturers and may change without notice. Images may be
            illustrative and may show optional accessories.
          </p>
          <p>
            The manufacturer&rsquo;s official documentation and your signed quotation take
            precedence over anything shown on this site. Availability of any product in Kuwait is
            subject to the applicable regulatory approvals and registrations.
          </p>
        </>
      ),
    },
    {
      id: "quotes",
      title: "Prices, quotations and orders",
      body: (
        <>
          <p>
            Nothing on this site is an offer to sell. Any price shown is indicative only, excludes
            taxes, delivery, installation and training unless stated, and may change.
          </p>
          <p>
            Using the quote list or sending an enquiry does not create a contract. A sale is only
            binding once we issue a written quotation and it is accepted in writing, or a
            purchase contract is signed. That quotation or contract, and our terms of sale, govern
            the supply.
          </p>
        </>
      ),
    },
    {
      id: "trademarks",
      title: "Trademarks and manufacturer brands",
      body: (
        <p>
          Manufacturer names, product names and logos belong to their respective owners. We show
          them to identify the products we supply. Their display does not mean a manufacturer
          endorses this website beyond our commercial relationship with them.
        </p>
      ),
    },
    {
      id: "our-content",
      title: "Our content",
      body: (
        <p>
          The QuipMed name and logo, the design of this site and the text we wrote belong to
          QuipMed. You may view and print pages for your own business use. You may not copy,
          republish or use them commercially without our written permission.
        </p>
      ),
    },
    {
      id: "credits",
      title: "Third-party credits",
      body: (
        <p>
          The 3D brain on our home page is based on{" "}
          <a href="https://sketchfab.com/3d-models/human-brain-7a27c17fd6c0488bb31ab093236a47fb" target="_blank" rel="noopener noreferrer">
            &ldquo;Human Brain&rdquo;
          </a>{" "}
          by 3DRT STUDIOS, licensed under{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">
            CC BY 4.0
          </a>
          . We changed its materials and shading and compressed it for the web.
        </p>
      ),
    },
    {
      id: "acceptable-use",
      title: "Acceptable use",
      body: (
        <>
          <p>When using the site you must not:</p>
          <ul>
            <li>submit false information or impersonate someone else;</li>
            <li>send patient health information through our forms;</li>
            <li>try to access accounts, data or systems you are not authorised to use;</li>
            <li>probe, scan or test the site&rsquo;s security, or interfere with its operation;</li>
            <li>scrape or copy the site in bulk, or upload malicious code.</li>
          </ul>
          <p>We may block access from anyone who breaks these rules.</p>
        </>
      ),
    },
    {
      id: "links",
      title: "Links to other websites",
      body: (
        <p>
          The site links to manufacturer websites, WhatsApp, LinkedIn and Google Maps. We
          don&rsquo;t control those services and aren&rsquo;t responsible for their content or
          privacy practices.
        </p>
      ),
    },
    {
      id: "liability",
      title: "Our responsibility to you",
      body: (
        <>
          <p>
            We work to keep the site accurate and available, but we provide it &ldquo;as is&rdquo;
            and cannot guarantee it will always be complete, current or uninterrupted.
          </p>
          <p>
            To the extent the law allows, we are not liable for any loss arising from reliance on
            information on this site, or for indirect or consequential loss. Nothing in these
            terms limits liability that cannot be limited by law. Our responsibility for any
            product you buy is set out in the quotation or contract for that sale.
          </p>
        </>
      ),
    },
    {
      id: "privacy",
      title: "Privacy",
      body: (
        <p>
          How we handle personal information is explained in our{" "}
          <Link to="/privacy">privacy policy</Link> and <Link to="/cookies">cookie policy</Link>.
        </p>
      ),
    },
    {
      id: "law",
      title: "Governing law",
      body: (
        <p>
          These terms are governed by the laws of the State of Kuwait. The courts of Kuwait have
          jurisdiction over any dispute arising from them or from your use of the site.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes and contact",
      body: (
        <p>
          We may update these terms and will change the effective date when we do. Questions:{" "}
          <a href={`mailto:${c.email}`}>{c.email}</a>.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      current="/terms"
      eyebrow="Legal"
      title="Terms of use"
      intro={
        <p>
          The rules for using this website, and how product information, prices and enquiries
          on it should be read.
        </p>
      }
      sections={sections}
    />
  );
}
