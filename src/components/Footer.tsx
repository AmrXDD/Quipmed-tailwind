import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Linkedin } from "lucide-react";
import { useCompanyInfo } from "@/hooks/useSupabase";
import Logo from "./Logo";

export default function Footer() {
  const c = useCompanyInfo();
  return (
    <footer className="relative border-t border-white/5 bg-navy-900">
      <div className="bg-grid-dots-dark [background-size:20px_20px]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4 lg:px-8">
          <div className="md:col-span-2">
            <Logo className="block h-12" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-mid">
              {c.about}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Reliable", "Modern", "Strong"].map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-cyan-neon/25 bg-white/5 px-3 py-1 text-xs font-medium text-cyan-soft"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Navigate
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-mid">
              <li><Link to="/" className="hover:text-mint">Home</Link></li>
              <li><Link to="/about" className="hover:text-mint">About</Link></li>
              <li><Link to="/products" className="hover:text-mint">Products</Link></li>
              <li><Link to="/brands" className="hover:text-mint">Brands</Link></li>
              <li><Link to="/contact" className="hover:text-mint">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Contact
            </h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-mid">
              <li className="flex items-start gap-2">
                <Mail size={14} className="mt-1 shrink-0 text-mint" />
                <a href={`mailto:${c.email}`} className="hover:text-cyan-neon">
                  {c.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone size={14} className="mt-1 shrink-0 text-mint" />
                <a href={`tel:${c.phone?.replace(/\s/g, "")}`} className="hover:text-cyan-neon">
                  {c.phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-1 shrink-0 text-mint" />
                <span>{c.address}</span>
              </li>
              {c.linkedin && (
                <li className="flex items-start gap-2">
                  <Linkedin size={14} className="mt-1 shrink-0 text-mint" />
                  <a
                    href={c.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-cyan-neon"
                  >
                    LinkedIn
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-slate-mid lg:flex-row lg:px-8">
          <p>
            © {new Date().getFullYear()} {c.name}. {c.tagline} | Designed by Amr Gharmawy
          </p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
            {c.name_ar}
          </p>
        </div>
      </div>
    </footer>
  );
}
