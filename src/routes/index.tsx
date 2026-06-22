import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";
import { CompanyCard } from "@/components/CompanyCard";
import { useCompanies } from "@/lib/companyApi";
import { type CompanySummary } from "@/lib/companyData";
import { Skeleton } from "@/components/ui/skeleton";

const COLLEGE_NAME = "Sri Venkateswara College of Engineering";
const COLLEGE_SHORT = "SVCE";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${COLLEGE_NAME} Placement Intelligence Hub` },
      {
        name: "description",
        content: `${COLLEGE_NAME} Companies Research & Placement Analytics Portal — your strategic edge for campus placements.`,
      },
    ],
  }),
  component: IndexPage,
});

const CATEGORIES = ["All", "Super Dream", "Dream", "Standard", "Regular"] as const;
const TYPE_COLOR: Record<string, string> = {
  "Super Dream": "#7c3aed",
  Dream: "#2563eb",
  Standard: "#16a34a",
  Regular: "#d97706",
};

function IndexPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const { data: companies = [], isLoading, isError, error, refetch } = useCompanies();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: companies.length };
    for (const c of companies) map[c.company_type] = (map[c.company_type] || 0) + 1;
    return map;
  }, [companies]);

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase();
    return companies.filter((c) => {
      const matchesCat = category === "All" || c.company_type === category;
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.short_name.toLowerCase().includes(q) ||
        c.headquarters_address.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [companies, debounced, category]);

  const reset = () => {
    setQuery("");
    setCategory("All");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              {COLLEGE_SHORT} · INTELLIGENCE PLATFORM
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {COLLEGE_NAME}{" "}
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Companies Research &amp; Placement Analytics Portal
              </span>
            </h1>
            <p className="max-w-2xl text-base text-slate-500 sm:text-lg">
              Your strategic edge for campus placements.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative mt-6 max-w-xl"
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search companies, HQ, sectors…"
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm shadow-sm outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = cat === category;
            const color = TYPE_COLOR[cat] || "#334155";
            return (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCategory(cat)}
                className="relative rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
                style={{
                  borderColor: active ? color : "#e5e7eb",
                  color: active ? "#fff" : "#334155",
                  backgroundColor: active ? color : "#fff",
                }}
              >
                {cat}
                <span
                  className="ml-2 rounded-full px-2 py-0.5 text-xs"
                  style={{
                    backgroundColor: active ? "rgba(255,255,255,0.2)" : "#f1f5f9",
                    color: active ? "#fff" : "#64748b",
                  }}
                >
                  {counts[cat] ?? 0}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full rounded-2xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
            <p className="font-heading text-lg font-semibold text-red-700">
              Unable to load companies.
            </p>
            <p className="mt-2 text-sm text-red-600">{String(error)}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="font-heading text-lg font-semibold text-slate-800">
              No matching companies
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try a different search or category.
            </p>
            <button
              onClick={reset}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.06 } },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <AnimatePresence>
              {filtered.map((c) => (
                <motion.div
                  key={c.company_id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.35 }}
                  layout
                >
                  <CompanyCard company={c} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}
