import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Linkedin, Globe } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { buildIntelligenceSections } from "@/data/intelligenceData";
import { useCompanyProfile } from "@/lib/companyApi";
import { CompanyLogo } from "@/components/CompanyLogo";
import { isNullish, splitItems } from "@/lib/companyData";

export const Route = createFileRoute("/company/intelligence")({
  component: CompanyIntelligence,
});

function renderValue(key: string, value: unknown) {
  if (isNullish(value)) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
        Not Available
      </span>
    );
  }
  const s = String(value);
  // URLs
  if (/^https?:\/\//i.test(s)) {
    const isVideo = /youtube\.com|youtu\.be|vimeo\.com/i.test(s);
    return (
      <a
        href={s}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
      >
        {isVideo ? "Watch video" : "Open link"}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }
  // Rating like 4.1/5
  if (/^\d(\.\d+)?\/\d+$/.test(s)) {
    return (
      <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-sm font-medium text-amber-700">
        ⭐ {s}
      </span>
    );
  }
  // Lists via ; or , or newline → pills (but skip if long sentence-y values)
  if (/[;\n]|, /.test(s) && s.length < 600 && !/\b(and|the|that|which)\b/i.test(s.split(/[;,]/)[0] ?? "")) {
    const items = splitItems(s).slice(0, 24);
    if (items.length > 1) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it, i) => (
            <span
              key={i}
              className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
            >
              {it}
            </span>
          ))}
        </div>
      );
    }
  }
  // Long paragraph
  if (s.length > 140) return <p className="leading-relaxed text-slate-700">{s}</p>;
  return <span className="text-slate-800">{s}</span>;
}

function FieldRow({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex flex-col gap-1 border-t border-slate-100 py-3 first:border-t-0 sm:flex-row sm:items-start sm:gap-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 sm:w-1/3">
        {label}
      </dt>
      <dd className="text-sm sm:w-2/3">{renderValue(label, value)}</dd>
    </div>
  );
}

function CompanyIntelligence() {
  const { selected } = useCompany();
  const { data: profile, isLoading, isError, error, refetch } = useCompanyProfile(
    selected?.companyId ?? null,
  );

  const sections = useMemo(() => buildIntelligenceSections(profile?.full), [profile]);
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const isScrollingRef = useRef(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const handler = () => {
      if (isScrollingRef.current) return;
      const offset = 200;
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = sectionRefs.current[s.id];
        if (el && el.getBoundingClientRect().top < offset) current = s.id;
      }
      if (current && current !== activeId) setActiveId(current);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [sections, activeId]);

  useEffect(() => {
    if (!activeId) return;
    const tab = tabRefs.current[activeId];
    if (tab) tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  const scrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    isScrollingRef.current = true;
    setActiveId(id);
    const top = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top, behavior: "smooth" });
    setTimeout(() => (isScrollingRef.current = false), 700);
  };

  if (!selected) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <p>Pick a company to view intelligence.</p>
          <Link to="/" className="mt-2 inline-block text-blue-600 hover:underline">
            Back to companies
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <p>Loading company data…</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4 text-center">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8">
          <p className="text-base font-semibold text-red-700">
            Unable to load company details.
          </p>
          <p className="mt-2 text-sm text-red-600">{String(error)}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center text-slate-500">
          <p>Company not found.</p>
          <Link to="/" className="mt-2 inline-block text-blue-600 hover:underline">
            Back to companies
          </Link>
        </div>
      </div>
    );
  }

  const f = profile.full;

  return (
    <div className="bg-white">
      {/* Sticky info bar */}
      <div className="sticky top-14 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <CompanyLogo
              name={profile.name}
              fallbackUrl={profile.logo_url}
              size={40}
              className="ring-1 ring-slate-200"
            />
            <div className="min-w-0">
              <h1 className="truncate font-heading text-base font-semibold text-slate-900 sm:text-lg">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2 py-0.5">
                  {profile.category || "Enterprise"}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {f.website_url && (
              <a
                href={f.website_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Globe className="h-3.5 w-3.5" /> Website
              </a>
            )}
            {f.linkedin_url && (
              <a
                href={f.linkedin_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-slate-100">
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
            <div className="flex gap-1 py-2">
              {sections.map((s) => {
                const active = s.id === activeId;
                return (
                  <button
                    key={s.id}
                    ref={(el) => {
                      tabRefs.current[s.id] = el;
                    }}
                    onClick={() => scrollToSection(s.id)}
                    className={`relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {s.title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        {sections.map((section, idx) => {
          const Icon = section.icon;
          const populated = section.fields.filter((f0) => !isNullish(f[f0.key]));
          return (
            <motion.section
              key={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              id={section.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, delay: Math.min(idx * 0.02, 0.2) }}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <header className="flex items-center justify-between gap-3 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h2 className="font-heading text-base font-semibold text-slate-900 sm:text-lg">
                    {section.title}
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {populated.length}/{section.fields.length}
                </span>
              </header>
              <dl>
                {section.fields.map((field) => (
                  <FieldRow
                    key={field.key}
                    label={field.label}
                    value={f[field.key]}
                  />
                ))}
              </dl>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
