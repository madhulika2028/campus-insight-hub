import { useQuery } from "@tanstack/react-query";
import { SEED_COMPANIES } from "@/data/seedCompanies";
import { SKILL_TOPICS } from "@/data/skillTopics";
import {
  normalizeCompanyProfile,
  normalizeCompanySummary,
  normalizeDashboardSkills,
  type DashboardSkill,
} from "./companyData";

export type SkillTopic = {
  level_number: number;
  topic: string;
};

export type DashboardSkillWithTopics = DashboardSkill & {
  topics: SkillTopic[];
};

// Phase 1 is UI-only and runs entirely off the bundled seed data.
// Queries are wrapped in useQuery so the components keep their loading /
// error states and we can swap in Supabase later without changing call sites.

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () =>
      SEED_COMPANIES.map((row) =>
        normalizeCompanySummary(row.company_id, row.short_json),
      ),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 0,
  });
}

export function useCompanyProfile(companyId: number | null) {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (companyId === null) return null;
      const row = SEED_COMPANIES.find((c) => c.company_id === companyId);
      if (!row) return null;
      return normalizeCompanyProfile(row.company_id, row.full_json, row.short_json);
    },
    enabled: companyId !== null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 0,
  });
}

export function useCompanySkills(companyId: number | null) {
  return useQuery<DashboardSkillWithTopics[]>({
    queryKey: ["company-skills", companyId],
    queryFn: async () => {
      if (companyId === null) return [];
      const row = SEED_COMPANIES.find((c) => c.company_id === companyId);
      if (!row) return [];

      const normalized = normalizeDashboardSkills(row.skill_levels).map(
        (skill) => ({
          ...skill,
          topics: (SKILL_TOPICS[skill.skill_set_id] ?? [])
            .slice()
            .sort((a, b) => a.level_number - b.level_number),
        }),
      );

      return normalized.sort((a, b) => b.required_level - a.required_level);
    },
    enabled: companyId !== null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 0,
  });
}
