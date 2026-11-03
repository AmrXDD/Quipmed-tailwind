import { useEffect } from "react";
import { Eyebrow, PrimaryButton, TextLink } from "@/components/ui/primitives";

export default function NotFound() {
  useEffect(() => {
    document.title = "Page not found · QuipMed";
    return () => {
      document.title = "QuipMed · Leading Medical Innovation";
    };
  }, []);

  return (
    <section className="grid min-h-[100svh] place-items-center bg-navy-900 px-5 pb-20 pt-36">
      <div className="w-full max-w-[90rem] sm:px-8 lg:px-12">
        <Eyebrow index="404">Not found</Eyebrow>
        <h1 className="mt-6 max-w-[18ch] text-balance text-[clamp(2.4rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-primary">
          This page isn&rsquo;t on the scan.
        </h1>
        <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-slate-mid">
          The link may be out of date, or the page may have moved. Try the catalogue, or tell us
          what you were looking for.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <PrimaryButton to="/products">Browse products</PrimaryButton>
          <TextLink to="/">Back to home</TextLink>
          <TextLink to="/contact">Contact us</TextLink>
        </div>
      </div>
    </section>
  );
}
