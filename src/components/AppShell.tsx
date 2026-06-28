import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, Library, User, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin, useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/library", label: "Biblioteca", icon: Library },
    { to: "/profile", label: "Perfil", icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 px-3 pt-3">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-navy/10 bg-card/92 px-4 shadow-soft backdrop-blur sm:px-5">
          <Link to="/dashboard" className="flex h-full shrink-0 items-center">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon }) => {
              const active = pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active ? "bg-navy text-navy-foreground shadow-soft" : "text-muted-foreground hover:bg-soft/80 hover:text-navy"
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                to="/admin"
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  pathname.startsWith("/admin") ? "bg-coral text-coral-foreground shadow-soft" : "text-coral hover:bg-coral/10"
                }`}
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden text-right md:block">
              <div className="text-xs text-muted-foreground">Ola,</div>
              <div className="text-sm font-semibold text-navy">{profile?.full_name || "aluno(a)"}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="hidden rounded-full border border-navy/10 bg-soft/60 p-2 text-muted-foreground transition hover:border-coral/40 hover:bg-coral/10 hover:text-coral md:block"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-full border border-navy/10 bg-soft/60 p-2 md:hidden"
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="mx-auto mt-2 max-w-7xl rounded-[1.5rem] border border-navy/10 bg-card p-3 shadow-card md:hidden">
            <div className="flex flex-col gap-1">
              {links.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-soft">
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              ))}
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-coral hover:bg-coral/10">
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
              <button onClick={handleSignOut} className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-muted-foreground hover:bg-soft">
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
