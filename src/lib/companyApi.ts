import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";
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

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_json")
        .select("company_id, short_json");

      if (error) throw error;
      if (!data) return [];

      return data.map((row) =>
        normalizeCompanySummary(row.company_id, row.short_json as Record<string, any>),
      );
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useCompanyProfile(companyId: number | null) {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      if (companyId === null) return null;

      const { data, error } = await supabase
        .from("company_json")
        .select("company_id, short_json, full_json")
        .eq("company_id", companyId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return normalizeCompanyProfile(
        data.company_id,
        data.full_json as Record<string, any>,
        data.short_json as Record<string, any>,
      );
    },
    enabled: companyId !== null,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 1,
  });
}

export function useCompanySkills(companyId: number | null) {
  return useQuery<DashboardSkillWithTopics[]>({
    queryKey: ["company-skills", companyId],
    queryFn: async () => {
      if (companyId === null) return [];

      const { data: skillLevels, error: skillLevelsError } = await supabase
        .from("company_skill_levels")
        .select(
          "company_id, skill_set_id, required_level, required_proficiency_level_id",
        )
        .eq("company_id", companyId);

      if (skillLevelsError) throw skillLevelsError;
      if (!skillLevels || skillLevels.length === 0) return [];

      const skillSetIds = Array.from(
        new Set(skillLevels.map((item) => item.skill_set_id)),
      );
      const proficiencyIds = Array.from(
        new Set(skillLevels.map((item) => item.required_proficiency_level_id)),
      );

      const { data: skillSets, error: skillSetsError } = await supabase
        .from("skill_set_master")
        .select("skill_set_id, skill_set_name")
        .in("skill_set_id", skillSetIds);
      if (skillSetsError) throw skillSetsError;

      const { data: proficiencyLevels, error: proficiencyError } = await supabase
        .from("proficiency_levels")
        .select("proficiency_level_id, proficiency_name")
        .in("proficiency_level_id", proficiencyIds);
      if (proficiencyError) throw proficiencyError;

      const { data: rawTopics, error: topicsError } = await supabase
        .from("skill_set_topics")
        .select("skill_set_id, level_number, topics")
        .in("skill_set_id", skillSetIds);
      if (topicsError) throw topicsError;

      const skillSetMap = new Map(
        (skillSets ?? []).map((row) => [row.skill_set_id, row.skill_set_name]),
      );
      const proficiencyMap = new Map(
        (proficiencyLevels ?? []).map((row) => [
          row.proficiency_level_id,
          row.proficiency_name,
        ]),
      );
      const topicsMap = new Map<number, SkillTopic[]>();
      for (const row of rawTopics ?? []) {
        const topics = topicsMap.get(row.skill_set_id) ?? [];
        topics.push({
          level_number: row.level_number,
          topic: String(row.topics ?? ""),
        });
        topicsMap.set(row.skill_set_id, topics);
      }

      const normalized = normalizeDashboardSkills(
        skillLevels.map((row) => ({
          skill_set_id: row.skill_set_id,
          skill_set_name:
            skillSetMap.get(row.skill_set_id) ?? "Unknown skill",
          required_level: row.required_level,
          required_proficiency:
            proficiencyMap.get(row.required_proficiency_level_id) ?? "",
        })),
      ).map((skill) => ({
        ...skill,
        topics: (topicsMap.get(skill.skill_set_id) ?? []).sort(
          (a, b) => a.level_number - b.level_number,
        ),
      }));

      return normalized.sort((a, b) => b.required_level - a.required_level);
    },
    enabled: companyId !== null,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
    retry: 1,
  });
}
