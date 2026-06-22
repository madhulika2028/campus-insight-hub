import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useCompany } from "@/context/CompanyContext";
import { ChevronRight, Home } from "lucide-react";

export const Route = createFileRoute("/company")({
  component: CompanyLayout,
});

function CompanyLayout() {
  const { selected } = useCompany();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selected) {
      // No selection in context — check localStorage once more before redirecting
      try {
        const raw = window.localStorage.getItem("selected-company");
        if (!raw) navigate({ to: "/" });
      } catch {
        navigate({ to: "/" });
      }
    }
  }, [selected, navigate]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur">
            <SidebarTrigger className="md:hidden" />
            <nav className="flex items-center gap-1.5 text-sm text-slate-500">
              <Link to="/" className="flex items-center gap-1 hover:text-slate-900">
                <Home className="h-3.5 w-3.5" />
                Companies
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-slate-900">
                {selected?.companyName ?? "Company"}
              </span>
            </nav>
          </header>
          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
