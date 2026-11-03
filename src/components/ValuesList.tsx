import { motion } from "framer-motion";

/** Numbered values, set as a quiet list with hairline dividers. */
export default function ValuesList({ items }: { items: { k: string; d: string }[] }) {
  return (
    <ol>
      {items.map((v, i) => (
        <motion.li
          key={v.k}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-6 border-t border-line py-10 first:border-t-0 first:pt-0 md:grid-cols-[6rem_minmax(0,1fr)] md:py-14"
        >
          <span className="tnum font-mono text-sm text-scan">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="text-[clamp(1.75rem,3vw,2.6rem)] font-medium leading-none tracking-[-0.03em] text-primary">
              {v.k}
            </h3>
            <p className="mt-5 max-w-[48ch] text-pretty text-[16px] leading-relaxed text-slate-mid">
              {v.d}
            </p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
