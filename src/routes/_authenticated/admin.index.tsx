import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { supabase } from "@/integrations/supabase/client";
import { Users, Video, FolderTree, BookCheck, Plus, FolderCog, GraduationCap } from "lucide-react";
import adminVisual from "@/assets/admin-visual.png";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Painel da professora — English by Brígida" }] }),
  component: AdminHome,
});

function AdminHome() {
  return (
    <AppShell>
      <AdminGate>
        <AdminInner />
      </AdminGate>
    </AppShell>
  );
}

export function AdminTabs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const tabs: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }> = [
    { to: "/admin", label: "Visão geral", icon: BookCheck, exact: true },
    { to: "/admin/lessons", label: "Aulas", icon: Video },
    { to: "/admin/categories", label: "Categorias", icon: FolderTree },
    { to: "/admin/students", label: "Alunos", icon: Users },
  ];
  return (
    <div className="mb-6 flex flex-wrap gap-1.5 rounded-full bg-soft p-1.5">
      {tabs.map(({ to, label, icon: Icon, exact }) => {
        const active = exact ? pathname === to : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to as "/admin"}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active ? "bg-card text-navy shadow-soft" : "text-muted-foreground hover:text-navy"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        );
      })}
    </div>
  );
}

function AdminInner() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [students, lessons, published, categories] = await Promise.all([
        supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "student"),
        supabase.from("lessons").select("*", { count: "exact", head: true }),
        supabase.from("lessons").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("categories").select("*", { count: "exact", head: true }),
      ]);
      return {
        students: students.count ?? 0,
        lessons: lessons.count ?? 0,
        published: published.count ?? 0,
        categories: categories.count ?? 0,
      };
    },
  });

  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-[2rem] bg-navy text-card shadow-card">
        <img src={adminVisual} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/82 to-navy/12" />
        <div className="relative flex min-h-72 flex-wrap items-center justify-between gap-5 p-6 sm:p-8 lg:p-10">
          <div>
            <span className="inline-flex rounded-full bg-card/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-card/75 backdrop-blur">
              Painel administrativo
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-card sm:text-4xl">Painel da professora</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-card/72">Gerencie aulas, categorias e alunos com um painel visual e organizado.</p>
          </div>
          <Link to="/admin/lessons/new" className="inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-coral-foreground shadow-soft transition hover:bg-coral/90">
            <Plus className="h-4 w-4" /> Nova aula
          </Link>
        </div>
      </section>
      <AdminTabs />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Alunos" value={stats.data?.students ?? 0} color="bg-brand" />
        <StatCard icon={Video} label="Aulas (total)" value={stats.data?.lessons ?? 0} color="bg-navy" />
        <StatCard icon={BookCheck} label="Publicadas" value={stats.data?.published ?? 0} color="bg-teal" />
        <StatCard icon={FolderCog} label="Categorias" value={stats.data?.categories ?? 0} color="bg-gold" />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <QuickAction to="/admin/lessons/new" title="Cadastrar nova aula" desc="Adicione uma aula com vídeo e materiais." />
        <QuickAction to="/admin/lessons" title="Gerenciar aulas" desc="Edite, publique ou exclua aulas existentes." />
        <QuickAction to="/admin/categories" title="Organizar categorias" desc="Crie e organize categorias de estudo." />
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${color} text-white`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-display text-3xl font-extrabold text-navy">{value}</div>
    </div>
  );
}

function QuickAction({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to as "/admin"} className="block rounded-3xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
      <h3 className="font-display text-base font-bold text-navy">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <span className="mt-3 inline-block text-sm font-semibold text-brand">Abrir →</span>
    </Link>
  );
}
