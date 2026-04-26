import { useEffect, useState } from "react";
import { Users, Mail, Phone, Clock, Building2, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Inquiry = {
  id: string;
  name: string;
  full_name?: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  status?: string | null;
  created_at?: string;
};

export default function InquiriesPanel() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async () => {
    if (!supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }

    setLoading(true);
    // We select specifically what we need. 
    // If 'full_name' rename failed in SQL, this query is now safer.
    const { data, error: fetchError } = await supabase
      .from("inquiries")
      .select("id, name, full_name, email, phone, company, message, status, created_at")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      const formattedData = (data as any[]).map((item) => ({
        ...item,
        // Robust fallback: Priority to 'name', then 'full_name', then 'email'
        name: item.name || item.full_name || item.email || "New Inquiry",
      }));
      setItems(formattedData);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
          <Users className="text-cyan-neon" size={24} />
          Customers & Inquiries
        </h2>
        <p className="text-sm text-slate-mid max-w-2xl">
          Real-time feed of leads generated from the QuipMed contact portal.
          Manage procurement requests and partnership enquiries below.
        </p>
      </header>

      {loading && (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-white/5 bg-navy-800/50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-neon border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-slate-mid">Fetching latest leads...</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-400">
          <p className="font-bold uppercase tracking-widest text-[10px] mb-2">Database Error</p>
          <div className="flex flex-col gap-3">
            <p>{error}</p>
            <button
              onClick={() => fetchInquiries()}
              className="w-fit rounded-lg bg-red-500/20 px-3 py-1 text-xs font-semibold hover:bg-red-500/30 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-3xl border border-white/5 bg-navy-800/50 p-20 text-center">
          <MessageSquare className="mx-auto text-slate-mid/20 mb-4" size={48} />
          <p className="text-slate-mid font-medium">No inquiries received yet.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {items.map((inq) => (
          <div
            key={inq.id}
            className="group relative flex flex-col rounded-3xl border border-white/5 bg-navy-800/40 p-6 transition-all hover:border-cyan-neon/30 hover:bg-navy-800/60"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-white group-hover:text-cyan-neon transition-colors">
                  {inq.name}
                </h3>
                {inq.company && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-mid">
                    <Building2 size={12} />
                    {inq.company}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${inq.status === 'New' || !inq.status ? 'bg-cyan-neon/10 text-cyan-neon' : 'bg-white/5 text-slate-mid'
                  }`}>
                  {inq.status || "New"}
                </span>
                {inq.created_at && (
                  <span className="text-[10px] text-slate-mid flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(inq.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 border-t border-white/5 pt-6 sm:grid-cols-2">
              {inq.email && (
                <a
                  href={`mailto:${inq.email}`}
                  className="flex items-center gap-3 text-xs text-slate-mid hover:text-white transition-colors"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/5">
                    <Mail size={12} />
                  </div>
                  <span className="truncate">{inq.email}</span>
                </a>
              )}
              {inq.phone && (
                <a
                  href={`tel:${inq.phone}`}
                  className="flex items-center gap-3 text-xs text-slate-mid hover:text-white transition-colors"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-lg bg-white/5">
                    <Phone size={12} />
                  </div>
                  <span>{inq.phone}</span>
                </a>
              )}
            </div>

            {inq.message && (
              <div className="mt-4 rounded-xl bg-navy-900/50 p-4 text-sm leading-relaxed text-slate-light">
                {inq.message}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}