import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lock } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";
import { useCompanyProfile, useCompanySkills } from "@/lib/companyApi";
import { type DashboardSkill } from "@/lib/companyData";
import { CompanyLogo } from "@/components/CompanyLogo";

export const Route = createFileRoute("/company/skills")({
  component: SkillIntelligence,
});

const BLOOM: Record<DashboardSkill["bloom"], { label: string; color: string; bg: string }> = {
  CU: { label: "Understand", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  AP: { label: "Apply", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  AS: { label: "Analyze", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  EV: { label: "Evaluate", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  CR: { label: "Create", color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
};

const CRIT: Record<DashboardSkill["criticality"], { color: string; bg: string }> = {
  Critical: { color: "#dc2626", bg: "rgba(220,38,38,0.08)" },
  Important: { color: "#d97706", bg: "rgba(217,119,6,0.08)" },
  Baseline: { color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
};

function SkillCard({ skill }: { skill: SkillWithTopics }) {
  const [open, setOpen] = useState(false);
  const bloom = BLOOM[skill.bloom];
  const crit = CRIT[skill.criticality];
  const topics = skill.topics || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-slate-50"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-semibold text-slate-900">
              {skill.skill_set_name}
            </h3>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ color: bloom.color, backgroundColor: bloom.bg }}
            >
              {skill.bloom} · {bloom.label}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ color: crit.color, backgroundColor: crit.bg }}
            >
              {skill.criticality}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.required_level * 10}%` }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, damping: 18 }}
                className="h-full rounded-full"
                style={{ backgroundColor: bloom.color }}
              />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {skill.required_level}/10
            </span>
          </div>
        </div>
        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-slate-100"
          >
            <ol className="p-5 space-y-2">
              {topics.map((t) => {
                const beyond = t.level_number > skill.required_level;
                return (
                  <li
                    key={t.level_number}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                      beyond
                        ? "border-dashed border-slate-200 bg-slate-50 text-slate-400"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: beyond ? "#f1f5f9" : bloom.bg,
                        color: beyond ? "#94a3b8" : bloom.color,
                      }}
                    >
                      {t.level_number}
                    </span>
                    <span className="flex-1 text-sm">{t.topic}</span>
                    {beyond && (
                      <span className="flex items-center gap-1 text-xs italic text-slate-400">
                        <Lock className="h-3 w-3" /> Beyond scope
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

type SkillWithTopics = DashboardSkill & {
  topics: Array<{ level_number: number; topic: string }>;
};

function SkillIntelligence() {
  const { selected } = useCompany();
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
    refetch: refetchProfile,
  } = useCompanyProfile(selected?.companyId ?? null);
  const {
    data: skills,
    isLoading: isSkillsLoading,
    isError: isSkillsError,
    error: skillsError,
    refetch: refetchSkills,
  } = useCompanySkills(selected?.companyId ?? null);

  const loading = isProfileLoading || isSkillsLoading;
  const error = isProfileError ? profileError : isSkillsError ? skillsError : null;

  if (!selected) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <Link to="/" className="text-blue-600 hover:underline">
          Pick a company
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <p>Loading skill intelligence…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center px-4 text-center">
        <div className="max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8">
          <p className="text-base font-semibold text-red-700">
            Unable to load skill intelligence.
          </p>
          <p className="mt-2 text-sm text-red-600">Something went wrong. Please try again.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                refetchProfile();
                refetchSkills();
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Back to companies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-slate-500">
        <p>Company profile not found.</p>
      </div>
    );
  }

  const availableSkills = skills ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <header className="flex items-center gap-3">
        <CompanyLogo
          name={profile.name}
          fallbackUrl={profile.logo_url}
          size={44}
          className="ring-1 ring-slate-200"
        />
        <div>
          <h1 className="font-heading text-xl font-semibold text-slate-900 sm:text-2xl">
            {profile.name} Skill Intelligence
          </h1>
          <p className="text-sm text-slate-500">
            What this employer expects, mapped to a 10-level mastery ladder.
          </p>
        </div>
      </header>

      {/* Bloom legend */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
          Bloom levels
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {(Object.keys(BLOOM) as Array<keyof typeof BLOOM>).map((k) => (
            <div
              key={k}
              className="rounded-xl border border-slate-100 px-3 py-2 text-sm"
              style={{ backgroundColor: BLOOM[k].bg, color: BLOOM[k].color }}
            >
              <div className="font-semibold">{k}</div>
              <div className="text-xs opacity-80">{BLOOM[k].label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Criticality legend */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(CRIT) as Array<keyof typeof CRIT>).map((k) => (
          <div
            key={k}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div
              className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ color: CRIT[k].color, backgroundColor: CRIT[k].bg }}
            >
              {k}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {k === "Critical"
                ? "Score ≥ 7. Must clear to be considered."
                : k === "Important"
                  ? "Score ≥ 5. Strong differentiator."
                  : "Score < 5. Nice to have."}
            </p>
          </div>
        ))}
      </section>

      {/* Skills */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {availableSkills.map((s) => (
          <SkillCard key={s.skill_set_id} skill={s} />
        ))}
      </div>
    </div>
  );
}
