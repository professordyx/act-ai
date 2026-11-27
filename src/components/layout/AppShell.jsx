import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/i18n";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import GlobalSearch from "@/components/layout/GlobalSearch";

import ActAILogo from "@/components/brand/ActAILogo";

const LOGO = "https://media.base44.com/images/public/workspaces/67dcbb69c0affc59bd5d5020/brands/402f67444_website_logo_addc7423.png";

export const NAV = [
  { to: "/dashboard", key: "nav.dashboard", exact: true },
  { to: "/meetings", key: "nav.meetings" },
  { to: "/approvals", key: "nav.approvals" },
  { to: "/actions", key: "nav.actions" },
  { to: "/repository", key: "nav.repository" },
  { to: "/billing", key: "nav.billing" },
  { to: "/admin", key: "nav.admin" },
];

function NavLinks({ onClick, className = "" }) {
  const { t } = useI18n();
  return NAV.map((n) => (
    <Link key={n.to} to={n.to} activeOptions={{ exact: !!n.exact }} onClick={onClick} className={`nav-link ${className}`}>
      {t(n.key)}
    </Link>
  ));
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2">
            <ActAILogo markClass="h-8 w-auto" textClass="text-2xl" />
          </Link>
          <nav className="hidden items-center gap-6 lg:flex"><NavLinks /></nav>
          <GlobalSearch />
          <div className="flex items-center gap-2">
            <Button className="hidden rounded-full font-bold sm:inline-flex" onClick={() => navigate({ to: "/meetings/new" })}>
              <Plus className="mr-1 h-4 w-4" /> {t("common.newMeeting")}
            </Button>
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" title={user?.email} aria-label={t("common.logout")} onClick={() => logout()}><LogOut className="h-4 w-4" /></Button>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="icon" className="lg:hidden"><Menu className="h-4 w-4" /></Button></SheetTrigger>
              <SheetContent side="right" className="flex flex-col gap-4 pt-10">
                <NavLinks className="text-base" />
                <Button className="rounded-full font-bold" onClick={() => navigate({ to: "/meetings/new" })}>{t("common.newMeeting")}</Button>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6"><Outlet /></main>
      <footer className="bg-[#16293a] text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:justify-between sm:px-6">
          <div className="flex flex-col gap-3">
            <ActAILogo tone="light" markClass="h-7 w-auto" textClass="text-xl" />
            <span>{t("app.subtitle")}</span>
          </div>
          <div className="flex items-center gap-3 sm:self-end">
            <span className="text-xs uppercase tracking-widest text-slate-400">Criado por</span>
            <a href="https://dioceliogoulart.com.br" target="_blank" rel="noopener noreferrer" title="dioceliogoulart.com.br">
              <img src={LOGO} alt="Diocélio Goulart" className="h-7 w-auto rounded bg-white px-2 py-1 transition-opacity hover:opacity-80" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}