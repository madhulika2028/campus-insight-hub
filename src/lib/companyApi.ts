import { useQuery } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";
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

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("company_json")
        .select("company_id, short_json")
        .order("company_id", { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map((row: any) =>
        normalizeCompanySummary(
          row.company_id,
          (row.short_json ?? {}) as Record<string, any>,
        ),
      );
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return normalizeCompanyProfile(
        (data as any).company_id,
        ((data as any).full_json ?? {}) as Record<string, any>,
        ((data as any).short_json ?? {}) as Record<string, any>,
      );
    },
    enabled: companyId !== null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
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
        new Set(skillLevels.map((item: any) => item.skill_set_id)),
      );
      const proficiencyIds = Array.from(
        new Set(
          skillLevels.map((item: any) => item.required_proficiency_level_id),
        ),
      );

      const [skillSetsRes, proficiencyRes, topicsRes] = await Promise.all([
        supabase
          .from("skill_set_master")
          .select("skill_set_id, skill_set_name")
          .in("skill_set_id", skillSetIds),
        supabase
          .from("proficiency_levels")
          .select("proficiency_level_id, proficiency_name")
          .in("proficiency_level_id", proficiencyIds),
        supabase
          .from("skill_set_topics")
          .select("skill_set_id, level_number, topics")
          .in("skill_set_id", skillSetIds),
      ]);

      if (skillSetsRes.error) throw skillSetsRes.error;
      if (proficiencyRes.error) throw proficiencyRes.error;

      const skillSetMap = new Map<number, string>(
        (skillSetsRes.data ?? []).map((row: any) => [
          row.skill_set_id,
          row.skill_set_name,
        ]),
      );
      const proficiencyMap = new Map<number, string>(
        (proficiencyRes.data ?? []).map((row: any) => [
          row.proficiency_level_id,
          row.proficiency_name,
        ]),
      );

      // skill_set_topics may not exist or be readable; fall back to bundled topics.
      const dbTopicsMap = new Map<number, SkillTopic[]>();
      if (!topicsRes.error) {
        for (const row of (topicsRes.data ?? []) as any[]) {
          const arr = dbTopicsMap.get(row.skill_set_id) ?? [];
          arr.push({
            level_number: row.level_number,
            topic: String(row.topics ?? ""),
          });
          dbTopicsMap.set(row.skill_set_id, arr);
        }
      }

      const normalized = normalizeDashboardSkills(
        skillLevels.map((row: any) => ({
          skill_set_id: row.skill_set_id,
          skill_set_name:
            skillSetMap.get(row.skill_set_id) ?? "Unknown skill",
          required_level: row.required_level,
          required_proficiency:
            proficiencyMap.get(row.required_proficiency_level_id) ?? "",
        })),
      ).map((skill) => {
        const dbTopics = dbTopicsMap.get(skill.skill_set_id);
        const topics =
          dbTopics && dbTopics.length > 0
            ? dbTopics
            : (SKILL_TOPICS[skill.skill_set_id] ?? []);
        return {
          ...skill,
          topics: topics
            .slice()
            .sort((a, b) => a.level_number - b.level_number),
        };
      });

      return normalized.sort((a, b) => b.required_level - a.required_level);
    },
    enabled: companyId !== null,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
  });
}
