import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQuantity, subtotal, clear } =
    useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-navy-900/70 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-md flex-col border-l border-white/10 bg-navy-900 shadow-2xl"
            role="dialog"
            aria-label="Shopping cart"
          >
            <header className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-soft">
                <ShoppingBag size={16} className="text-cyan-neon" /> Your cart
              </h2>
              <button
                onClick={closeCart}
                className="text-slate-mid transition-colors hover:text-white"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <ShoppingBag size={32} className="text-slate-mid" />
                  <p className="mt-4 text-sm text-slate-light">
                    Your cart is empty.
                  </p>
                  <Link
                    to="/products"
                    onClick={closeCart}
                    className="mt-5 rounded-full bg-cyan-neon px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy-900 hover:shadow-neon"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((it) => (
                      <motion.li
                        key={it.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex gap-3 rounded-2xl border border-white/5 bg-white/5 p-3"
                      >
                        {it.image_url ? (
                          <img
                            src={it.image_url}
                            alt={it.name}
                            className="h-16 w-16 shrink-0 rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 shrink-0 rounded-xl border border-white/10 bg-white/5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {it.name}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-cyan-neon">
                            ${it.price.toLocaleString()}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <button
                              onClick={() => setQuantity(it.id, it.quantity - 1)}
                              className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-light hover:bg-white/10"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="min-w-[1.5rem] text-center text-sm text-white">
                              {it.quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(it.id, it.quantity + 1)}
                              className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-light hover:bg-white/10"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => removeItem(it.id)}
                              className="ml-auto text-slate-mid hover:text-red-400"
                              aria-label="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-white/5 bg-navy-900/90 px-6 py-5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-light">Subtotal</span>
                  <span className="font-mono text-lg font-bold text-white">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-mid">
                  Taxes and shipping calculated at checkout.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={clear}
                    className="flex-1 rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-light hover:bg-white/10"
                  >
                    Clear
                  </button>
                  <button className="flex-[2] rounded-full bg-cyan-neon py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-navy-900 hover:shadow-neon">
                    Checkout
                  </button>
                </div>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
