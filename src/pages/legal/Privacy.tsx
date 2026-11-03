import { Link } from "react-router-dom";
import { useCompanyInfo } from "@/hooks/useSupabase";
import LegalLayout, { type LegalSection } from "./LegalLayout";

export default function Privacy() {
  const c = useCompanyInfo();

  const sections: LegalSection[] = [
    {
      id: "who-we-are",
      title: "Who we are",
      body: (
        <>
          <p>
            This website, <strong>{c.website}</strong>, is operated by {c.name} ({c.name_ar}),
            a medical equipment supplier based in Kuwait (&ldquo;QuipMed&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;). We decide how and why the personal information described here is
            used.
          </p>
          <ul>
            <li>Address: {c.address}</li>
            <li>
              Email: <a href={`mailto:${c.email}`}>{c.email}</a>
            </li>
            <li>Phone: {c.phone}</li>
          </ul>
        </>
      ),
    },
    {
      id: "what-we-collect",
      title: "What we collect",
      body: (
        <>
          <h3>Information you give us</h3>
          <p>When you send an enquiry through our contact form we collect:</p>
          <ul>
            <li>your name and email address (required);</li>
            <li>your phone number, company or facility, and subject (optional);</li>
            <li>the product you are asking about, if any, and your message.</li>
          </ul>
          <p>
            If you email, call or message us on WhatsApp, we receive whatever you choose to
            send, together with your email address or phone number.
          </p>

          <h3>Information collected automatically</h3>
          <p>
            Like any website, the servers that deliver this site process technical data such as
            your IP address, browser type and the pages requested. This is used to deliver the
            site and keep it secure. <strong>We do not use analytics, advertising or tracking
            cookies, and we do not build profiles of visitors.</strong>
          </p>

          <h3>Information stored on your device</h3>
          <p>
            The site stores a small amount of information in your browser so it works as you
            expect: your quote list, your light/dark preference and your cookie choice. This
            stays on your device. See our <Link to="/cookies">cookie policy</Link> for the
            full list.
          </p>

          <h3>Please don&rsquo;t send patient information</h3>
          <p>
            Our forms are for business enquiries about equipment. Please do not include patient
            names, medical records or other health information about any individual. If you do,
            we will delete it.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use",
      title: "How we use it",
      body: (
        <>
          <p>We use your information only to:</p>
          <ul>
            <li>reply to your enquiry and prepare any quotation you ask for;</li>
            <li>manage our business relationship with you or your organisation;</li>
            <li>keep the website and our systems secure and prevent misuse;</li>
            <li>meet our legal, accounting and regulatory obligations.</li>
          </ul>
          <p>
            We rely on your request (to take steps before entering into a contract), our
            legitimate interest in running and protecting our business, and our legal
            obligations. Where we ask for your consent, such as for embedded content, you can
            withdraw it at any time.
          </p>
          <p>
            <strong>We do not sell your personal information</strong>, we do not use it for
            automated decision-making, and we will not add you to marketing emails unless you
            ask us to.
          </p>
        </>
      ),
    },
    {
      id: "sharing",
      title: "Who we share it with",
      body: (
        <>
          <p>We share personal information only with:</p>
          <ul>
            <li>
              <strong>Service providers</strong> that run the site for us: Supabase (database
              that stores enquiries) and Vercel (website hosting). They process data on our
              instructions and may not use it for their own purposes.
            </li>
            <li>
              <strong>Manufacturers</strong>, only where needed to prepare a quotation or arrange
              supply, installation or service you have asked for.
            </li>
            <li>
              <strong>Authorities</strong>, where we are required to by law or to protect our
              legal rights.
            </li>
          </ul>
          <h3>Third-party content</h3>
          <p>
            Some images and brand logos on this site are loaded from other servers (including
            manufacturer websites, Wikimedia, Clearbit, Google&rsquo;s favicon service and the
            images.weserv.nl image service). When your
            browser loads them, those servers receive your IP address, as with any web request.
            The Google map on our contact page only loads if you allow embedded content. Links
            to WhatsApp, LinkedIn and manufacturer websites take you to services with their own
            privacy policies.
          </p>
        </>
      ),
    },
    {
      id: "transfers",
      title: "Where your data is stored",
      body: (
        <p>
          Enquiries are stored in a database hosted in Singapore. Our website host serves pages
          from data centres in several countries. This means your information may be processed
          outside Kuwait. We choose providers that protect data with encryption in transit and
          contractual safeguards.
        </p>
      ),
    },
    {
      id: "retention",
      title: "How long we keep it",
      body: (
        <ul>
          <li>
            Enquiries: up to 24 months after our last contact with you, unless they become part of
            an order or contract, in which case we keep them as long as the law requires for
            business records.
          </li>
          <li>Information stored in your browser: until you clear it or reset your choice.</li>
          <li>Server logs: kept by our hosting provider for a short period for security.</li>
        </ul>
      ),
    },
    {
      id: "security",
      title: "How we protect it",
      body: (
        <p>
          All traffic to this site is encrypted (HTTPS). Enquiries can only be read by
          authorised QuipMed staff, enforced by access rules in the database itself rather than
          just the website. No system is perfectly secure; if a breach affects your information
          we will tell you without undue delay where required.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your rights",
      body: (
        <>
          <p>You can ask us to:</p>
          <ul>
            <li>confirm whether we hold information about you and give you a copy;</li>
            <li>correct information that is wrong or incomplete;</li>
            <li>delete your information, where we don&rsquo;t need to keep it by law;</li>
            <li>stop or limit how we use it, or object to a particular use;</li>
            <li>withdraw consent you have given, at any time.</li>
          </ul>
          <p>
            Email <a href={`mailto:${c.email}`}>{c.email}</a> with the subject &ldquo;Privacy
            request&rdquo;. We may need to confirm your identity first, and we aim to reply
            within 30 days.
          </p>
        </>
      ),
    },
    {
      id: "children",
      title: "Children",
      body: (
        <p>
          This site is for healthcare professionals, facilities and businesses. It is not
          directed at children, and we do not knowingly collect information from anyone under
          18.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          We will update this page if the way we handle personal information changes, and change
          the effective date at the top. Significant changes will be highlighted on the site.
        </p>
      ),
    },
  ];

  return (
    <LegalLayout
      current="/privacy"
      eyebrow="Legal"
      title="Privacy policy"
      intro={
        <p>
          This policy explains what personal information QuipMed collects through this
          website, why, who we share it with and the choices you have. We keep it short and
          specific to what the site actually does.
        </p>
      }
      sections={sections}
    />
  );
}
