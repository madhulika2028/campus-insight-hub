export interface CompanySummary {
  company_id: number;
  name: string;
  short_name: string;
  logo_url: string;
  category: string;
  company_type: string;
  incorporation_year: number | string;
  employee_size: string;
  headquarters_address: string;
  yoy_growth_rate: string;
  website_url: string;
}

export interface CompanyProfile extends CompanySummary {
  full: Record<string, any>;
}

export interface DashboardSkill {
  skill_set_id: number;
  skill_set_name: string;
  required_level: number;
  required_proficiency: string;
  bloom: "CU" | "AP" | "AS" | "EV" | "CR";
  criticality: "Critical" | "Important" | "Baseline";
  difficulty: "EXPERT" | "ADVANCED" | "PRO" | "BEGINNER";
}

export const asString = (v: unknown, fallback = ""): string =>
  v === null || v === undefined ? fallback : String(v);

export const asRecord = (v: unknown): Record<string, any> =>
  v && typeof v === "object" ? (v as Record<string, any>) : {};

export const isNullish = (v: unknown): boolean => {
  if (v === null || v === undefined) return true;
  const s = String(v).trim().toLowerCase();
  return ["", "na", "n/a", "none", "-", "null", "undefined"].includes(s);
};

export const splitItems = (v: unknown): string[] => {
  if (isNullish(v)) return [];
  return String(v)
    .split(/[\n;•·]|(?:\.\s)/g)
    .map((s) => s.trim())
    .filter(Boolean);
};

export const titleCaseFromCode = (s: string): string =>
  s
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export const scoreToDifficulty = (
  level: number,
): DashboardSkill["difficulty"] => {
  if (level >= 8) return "EXPERT";
  if (level >= 6) return "ADVANCED";
  if (level >= 4) return "PRO";
  return "BEGINNER";
};

export const proficiencyToBloom = (
  level: number,
): DashboardSkill["bloom"] => {
  if (level <= 2) return "CU";
  if (level <= 4) return "AP";
  if (level <= 6) return "AS";
  if (level <= 8) return "EV";
  return "CR";
};

export const scoreToCriticality = (
  level: number,
): DashboardSkill["criticality"] => {
  if (level >= 7) return "Critical";
  if (level >= 5) return "Important";
  return "Baseline";
};

export function normalizeCompanySummary(
  company_id: number,
  short_json: Record<string, any>,
): CompanySummary {
  return {
    company_id,
    name: asString(short_json.name),
    short_name: asString(short_json.short_name || short_json.name),
    logo_url: asString(short_json.logo_url),
    category: asString(short_json.category),
    company_type: asString(short_json.company_type, "Standard"),
    incorporation_year: short_json.incorporation_year ?? "",
    employee_size: asString(short_json.employee_size),
    headquarters_address: asString(short_json.headquarters_address),
    yoy_growth_rate: asString(short_json.yoy_growth_rate),
    website_url: asString(short_json.website_url),
  };
}

export function normalizeCompanyProfile(
  company_id: number,
  full_json: Record<string, any>,
  short_json: Record<string, any>,
): CompanyProfile {
  const summary = normalizeCompanySummary(company_id, {
    ...short_json,
    ...full_json,
    logo_url: short_json.logo_url || full_json.logo_url,
  });
  return { ...summary, full: { ...full_json } };
}

export function normalizeDashboardSkills(
  skillLevels: Array<{
    skill_set_id: number;
    skill_set_name: string;
    required_level: number;
    required_proficiency: string;
  }>,
): DashboardSkill[] {
  return skillLevels.map((s) => ({
    ...s,
    bloom: proficiencyToBloom(s.required_level),
    criticality: scoreToCriticality(s.required_level),
    difficulty: scoreToDifficulty(s.required_level),
  }));
}
