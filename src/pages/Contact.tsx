import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Linkedin,
} from "lucide-react";
import { supabase, HAS_SUPABASE } from "@/lib/supabaseClient";
import { useCompanyInfo } from "@/hooks/useSupabase";
import type { InquiryInput } from "@/lib/types";

type Status = "idle" | "submitting" | "success" | "error";

type ContactFormValues = InquiryInput & { related_product?: string };

export default function Contact() {
  const c = useCompanyInfo();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormValues>();
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  useEffect(() => {
    const navState =
      (location.state as { product?: string; message?: string } | null) ?? null;
    const params = new URLSearchParams(location.search);
    const related = navState?.product || params.get("product");
    const prefilledMessage = navState?.message || params.get("message");
    if (related) setValue("related_product", related);
    if (prefilledMessage) setValue("message", prefilledMessage);
  }, [location, setValue]);

  const onSubmit = async (values: ContactFormValues) => {
    setStatus("submitting");
    setErrMsg("");
    try {
      if (HAS_SUPABASE && supabase) {
        const relatedPrefix = values.related_product
          ? `[Related product: ${values.related_product}]\n\n`
          : "";

        const { error } = await supabase.from("inquiries").insert({
          // We send both to ensure compatibility with our recent schema updates
          name: values.full_name,
          full_name: values.full_name,
          email: values.email,
          phone: values.phone || null,
          company: values.company || null,
          subject: values.subject || null,
          message: relatedPrefix + values.message,
          status: 'New'
        });

        if (error) throw error;
      } else {
        console.info("[dev] Inquiry captured:", values);
        await new Promise((r) => setTimeout(r, 700));
      }
      setStatus("success");
      reset();
    } catch (e: any) {
      console.error("Inquiry submission error:", e);
      setStatus("error");
      setErrMsg(e?.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <header className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-neon/25 bg-cyan-neon/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-soft">
            <Send size={12} /> Get in touch
          </span>
          <h1 className="mt-5 text-[clamp(2rem,4.5vw,4rem)] font-bold leading-[0.98] tracking-tight text-white">
            Let’s build better healthcare, together.
          </h1>
          <p className="mt-4 text-slate-mid">
            Reach out for product demonstrations, procurement enquiries,
            partnership opportunities, or technical support — we reply within
            one business day.
          </p>
        </header>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit(onSubmit)}
            className="relative rounded-3xl border border-white/5 bg-navy-800/60 p-6 md:p-8"
          >
            <h2 className="text-xl font-bold text-white">Send an enquiry</h2>
            <p className="mt-1 text-sm text-slate-mid">
              All fields marked with * are required.
            </p>

            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name *"
                error={errors.full_name?.message}
                htmlFor="full_name"
              >
                <input
                  id="full_name"
                  {...register("full_name", { required: "Your name is required" })}
                  className={inputCls}
                  placeholder="Dr. Jane Smith"
                />
              </Field>
              <Field
                label="Email *"
                error={errors.email?.message}
                htmlFor="email"
              >
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
                  className={inputCls}
                  placeholder="you@hospital.com"
                />
              </Field>
              <Field label="Phone" htmlFor="phone">
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register("phone")}
                  className={inputCls}
                  placeholder="+965 0000 0000"
                />
              </Field>
              <Field label="Company / Facility" htmlFor="company">
                <input
                  id="company"
                  {...register("company")}
                  className={inputCls}
                  placeholder="Al-Sabah Hospital"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Related product" htmlFor="related_product">
                  <input
                    id="related_product"
                    {...register("related_product")}
                    className={inputCls}
                    placeholder="e.g. Portable Ultrasound X3 (optional)"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Subject" htmlFor="subject">
                  <input
                    id="subject"
                    {...register("subject")}
                    className={inputCls}
                    placeholder="Procurement request for diagnostic imaging"
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field
                  label="Message *"
                  error={errors.message?.message}
                  htmlFor="message"
                >
                  <textarea
                    id="message"
                    rows={5}
                    {...register("message", {
                      required: "Please tell us how we can help",
                      minLength: { value: 10, message: "At least 10 characters" },
                    })}
                    className={`${inputCls} resize-y`}
                    placeholder="Tell us about the equipment, timelines and scope…"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-6 py-3 text-sm font-semibold text-navy-900 transition-all hover:shadow-neon disabled:opacity-60"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Send message <Send size={14} />
                  </>
                )}
              </button>
              <AnimatePresence mode="wait">
                {status === "success" && (
                  <motion.p
                    key="ok"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="status"
                    className="inline-flex items-center gap-2 text-sm text-mint"
                  >
                    <CheckCircle2 size={16} /> Thanks — we’ll be in touch shortly.
                  </motion.p>
                )}
                {status === "error" && (
                  <motion.p
                    key="err"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="inline-flex items-center gap-2 text-sm text-red-400"
                  >
                    <AlertTriangle size={16} /> {errMsg || "Submission failed."}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.form>

          <div className="flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-white/5 bg-navy-800/60 p-6"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(34,211,238,0.05) 1px, transparent 0)", backgroundSize: "24px 24px" }}
            >
              <h2 className="text-xl font-bold text-white">Headquarters</h2>
              <p className="mt-1 text-sm text-slate-mid">{c.name_ar}</p>
              <dl className="mt-6 space-y-5 text-sm">
                <InfoRow icon={<Mail size={15} />} label="Email">
                  <a href={`mailto:${c.email}`} className="text-white hover:text-cyan-neon transition-colors">
                    {c.email}
                  </a>
                </InfoRow>
                <InfoRow icon={<Phone size={15} />} label="Phone">
                  <a href={`tel:${c.phone?.replace(/\s/g, "")}`} className="text-white hover:text-cyan-neon transition-colors">
                    {c.phone}
                  </a>
                </InfoRow>
                <InfoRow icon={<MapPin size={15} />} label="Address">
                  <span className="text-white">{c.address}</span>
                </InfoRow>
                <InfoRow icon={<Clock size={15} />} label="Office hours">
                  <span className="text-white">{c.hours_weekdays}</span>
                  <br />
                  <span className="text-slate-mid">{c.hours_weekend}</span>
                </InfoRow>
                {c.linkedin && (
                  <InfoRow icon={<Linkedin size={15} />} label="LinkedIn">
                    <a
                      href={c.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white hover:text-cyan-neon transition-colors"
                    >
                      Connect on LinkedIn
                    </a>
                  </InfoRow>
                )}
              </dl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="overflow-hidden rounded-3xl border border-white/5 bg-navy-800/60 shadow-xl aspect-video"
            >
              {/* QUIP MED — Medical Equipment Supplier */}
              <iframe
                title="QUIP MED location"
                src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d3476.6203670780214!2d47.986475!3d29.381403!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjnCsDIyJzUzLjEiTiA0N8KwNTknMTEuMyJF!5e0!3m2!1sen!2sus!4v1778574191615!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "grayscale(1) invert(0.9) contrast(1.2) brightness(0.8)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "block w-full rounded-xl border border-white/10 bg-navy-900/40 px-4 py-3 text-sm text-white placeholder:text-slate-mid/40 outline-none transition-all focus:border-cyan-neon/60 focus:ring-2 focus:ring-cyan-neon/10";

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-mid">
        {label}
      </label>
      {children}
      {error && (
        <span className="mt-1.5 block text-xs text-red-400" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cyan-neon/10 text-cyan-neon ring-1 ring-cyan-neon/20">
        {icon}
      </span>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-mid">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm leading-relaxed text-white">{children}</dd>
      </div>
    </div>
  );
}