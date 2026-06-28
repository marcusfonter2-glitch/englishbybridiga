import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Search, PlayCircle, Clock, Sparkles, CheckCircle2, BookOpen, Trophy } from "lucide-react";
import dashboardVisual from "@/assets/dashboard-visual.png";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard - English by Brigida" }] }),
  component: Dashboard,
});

const LEVELS = [
  { v: "all", label: "Todos" },
  { v: "basic", label: "Basico" },
  { v: "intermediate", label: "Intermediario" },
  { v: "advanced", label: "Avancado" },
] as const;

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]["v"]>("all");

  const lessons = useQuery({
    queryKey: ["lessons", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, categories(name, slug, color)")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const progress = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_progress").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const list = lessons.data ?? [];
    return list.filter((l) => {
      if (level !== "all" && l.level !== level) return false;
      if (q.trim()) {
        const text = `${l.title} ${l.description ?? ""} ${l.categories?.name ?? ""}`.toLowerCase();
        if (!text.includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [lessons.data, q, level]);

  const completedCount = (progress.data ?? []).filter((p) => p.completed).length;
  const totalLessons = (lessons.data ?? []).length;
  const pct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-[2rem] bg-navy text-navy-foreground shadow-card">
        <img src={dashboardVisual} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/82 to-navy/20" />
        <div className="relative grid min-h-80 items-center gap-8 p-6 sm:p-8 lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
          <div>
            <span className="inline-flex rounded-full bg-card/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-card/75">
              Area do aluno
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-card sm:text-4xl">
              Ola, {profile?.full_name || "estudante"}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-card/76">
              Continue sua rotina de ingles com aulas organizadas, busca rapida e progresso sempre visivel.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <Stat icon={BookOpen} label="Aulas disponiveis" value={totalLessons} />
            <Stat icon={CheckCircle2} label="Concluidas" value={completedCount} />
            <Stat icon={Trophy} label="Progresso geral" value={`${pct}%`} />
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[1.75rem] border border-navy/10 bg-card/95 p-4 shadow-soft backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por titulo, categoria ou palavra-chave"
              className="w-full rounded-full border border-navy/10 bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {LEVELS.map((l) => (
              <button
                key={l.v}
                onClick={() => setLevel(l.v)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  level === l.v ? "bg-coral text-coral-foreground shadow-soft" : "bg-soft/70 text-navy hover:bg-soft"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Categorias" subtitle="Escolha um tema para estudar agora" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(categories.data ?? []).map((c, index) => {
            const count = (lessons.data ?? []).filter((l) => l.category_id === c.id).length;
            return (
              <Link
                key={c.id}
                to="/library"
                search={{ category: c.slug }}
                className="group overflow-hidden rounded-[1.5rem] border border-navy/10 bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-card"
              >
                <div className={`h-2 w-16 rounded-full ${index % 3 === 0 ? "bg-coral" : index % 3 === 1 ? "bg-brand" : "bg-navy"}`} />
                <h3 className="mt-4 font-display text-lg font-extrabold text-navy">{c.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{count} aula(s)</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader title="Aulas para continuar" subtitle={`${filtered.length} resultado(s)`} icon={<Sparkles className="h-5 w-5 text-coral" />} />
        {lessons.isLoading ? (
          <div className="mt-6 text-sm text-muted-foreground">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-navy/20 bg-card/70 p-10 text-center text-sm text-muted-foreground">
            Nenhuma aula encontrada. Tente outros filtros.
          </div>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => {
              const p = (progress.data ?? []).find((x) => x.lesson_id === l.id);
              return <LessonCard key={l.id} lesson={l} completed={!!p?.completed} />;
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number | string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-4 rounded-[1.25rem] border border-card/18 bg-card/12 p-4 backdrop-blur-md">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-card text-navy">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-[0.12em] text-card/60">{label}</div>
        <div className="font-display text-2xl font-extrabold text-card">{value}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-navy">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {icon}
    </div>
  );
}

export function LessonCard({
  lesson,
  completed,
}: {
  lesson: { id: string; title: string; description: string | null; level: string; duration_minutes: number | null; categories?: { name: string; color: string } | null };
  completed?: boolean;
}) {
  const levelLabel = lesson.level === "basic" ? "Basico" : lesson.level === "intermediate" ? "Intermediario" : "Avancado";

  return (
    <Link
      to="/lessons/$id"
      params={{ id: lesson.id }}
      className="group flex flex-col overflow-hidden rounded-[1.5rem] border border-navy/10 bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="relative aspect-video w-full bg-navy">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--color-navy)_0%,var(--color-brand)_62%,var(--color-coral)_100%)]" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-card shadow-soft transition group-hover:scale-110">
            <PlayCircle className="h-8 w-8 text-coral" />
          </div>
        </div>
        {completed && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[10px] font-bold text-navy">
            <CheckCircle2 className="h-3 w-3 text-coral" /> Concluida
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {lesson.categories && (
            <span className="rounded-full px-2 py-1 font-bold" style={{ background: `${lesson.categories.color}22`, color: lesson.categories.color }}>
              {lesson.categories.name}
            </span>
          )}
          <span className="rounded-full bg-soft px-2 py-1 font-bold text-navy">{levelLabel}</span>
          {lesson.duration_minutes && (
            <span className="ml-auto inline-flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" /> {lesson.duration_minutes} min
            </span>
          )}
        </div>
        <h3 className="mt-3 font-display text-base font-extrabold leading-snug text-navy">{lesson.title}</h3>
        {lesson.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{lesson.description}</p>}
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-coral">Assistir aula</span>
      </div>
    </Link>
  );
}
