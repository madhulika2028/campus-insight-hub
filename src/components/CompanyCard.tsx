import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { CompanyLogo } from "@/components/CompanyLogo";
import { useCompany } from "@/context/CompanyContext";
import { isNullish, type CompanySummary } from "@/lib/companyData";

const TYPE_STYLES: Record<string, string> = {
  "Super Dream": "bg-[#7c3aed]/10 text-[#7c3aed] border-[#7c3aed]/20",
  Dream: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20",
  Standard: "bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20",
  Regular: "bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20",
};

const NA = <span className="italic text-slate-400">not publicly available</span>;
const renderText = (v: string) =>
  isNullish(v) ? NA : <span className="text-slate-700">{v}</span>;

interface Props {
  company: CompanySummary;
}

function CompanyCardImpl({ company }: Props) {
  const navigate = useNavigate();
  const { selectCompany } = useCompany();
  const isNegative = company.yoy_growth_rate?.trim().startsWith("-");
  const badgeClass =
    TYPE_STYLES[company.company_type] || TYPE_STYLES.Standard;

  const handleClick = () => {
    selectCompany({
      companyId: company.company_id,
      companyName: company.name,
      logoUrl: company.logo_url,
    });
    navigate({ to: "/company/intelligence" });
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative flex h-full w-full flex-col rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm backdrop-blur-md transition-colors hover:border-blue-200 hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <CompanyLogo
          name={company.name}
          fallbackUrl={company.logo_url}
          size={52}
          className="ring-1 ring-slate-200 transition-transform group-hover:scale-105"
        />
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass}`}
        >
          {company.company_type}
        </span>
      </div>

      <div className="mt-4">
        <h3 className="font-heading text-lg font-semibold text-slate-900">
          {company.name}
        </h3>
        <p className="text-xs uppercase tracking-wide text-slate-400">
          {company.short_name}
        </p>
      </div>

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400" />
          {renderText(company.headquarters_address)}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="h-4 w-4 text-slate-400" />
          {renderText(company.employee_size)}
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          {isNegative ? (
            <TrendingDown className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          )}
          <span
            className={
              isNegative ? "text-red-600" : "text-slate-700"
            }
          >
            {isNullish(company.yoy_growth_rate)
              ? NA
              : `YoY ${company.yoy_growth_rate}`}
          </span>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between pt-3 text-sm text-slate-500">
        <span className="text-xs">{company.category}</span>
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
      </div>
    </motion.button>
  );
}

export const CompanyCard = memo(CompanyCardImpl);
