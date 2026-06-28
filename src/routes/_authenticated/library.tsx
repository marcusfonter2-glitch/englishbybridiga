import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ChevronDown, Search, LibraryBig } from "lucide-react";
import { LessonCard } from "./dashboard";
import libraryVisual from "@/assets/library-visual.png";

const searchSchema = z.object({ category: z.string().optional() });

export const Route = createFileRoute("/_authenticated/library")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Biblioteca - English by Brigida" }] }),
  component: Library,
});

const LEVELS = [
  { v: "all", label: "Todos os niveis" },
  { v: "basic", label: "Basico" },
  { v: "intermediate", label: "Intermediario" },
  { v: "advanced", label: "Avancado" },
] as const;

function Library() {
  const { category } = Route.useSearch();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<(typeof LEVELS)[number]["v"]>("all");
  const [cat, setCat] = useState<string>(category ?? "all");

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const lessons = useQuery({
    queryKey: ["lessons", "library"],
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

  const progress = useQuery({
    queryKey: ["progress", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("lesson_progress").select("*").eq("user_id", user!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const grouped = useMemo(() => {
    const list = (lessons.data ?? []).filter((l) => {
      if (level !== "all" && l.level !== level) return false;
      if (cat !== "all" && l.categories?.slug !== cat) return false;
      if (q.trim() && !`${l.title} ${l.description ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())) return false;
      return true;
    });
    const map = new Map<string, typeof list>();
    for (const l of list) {
      const key = l.categories?.name ?? "Sem categoria";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    return Array.from(map.entries());
  }, [lessons.data, level, cat, q]);

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-[2rem] bg-navy text-card shadow-card">
        <img src={libraryVisual} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/12" />
        <div className="relative grid min-h-72 gap-6 border border-card/10 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-card/80 backdrop-blur">
              <LibraryBig className="h-3.5 w-3.5" />
              Biblioteca
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-card sm:text-4xl">Escolha sua proxima aula</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-card/74">
              Use filtros rapidos para encontrar grammar, listening, conversation e outras trilhas sem perder tempo.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-card/18 bg-card/14 px-6 py-5 text-card backdrop-blur-md">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-card/62">Resultados</div>
            <div className="font-display text-4xl font-extrabold">{(lessons.data ?? []).length}</div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-3 rounded-[1.75rem] border border-navy/10 bg-card/95 p-4 shadow-soft backdrop-blur lg:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar aulas..."
            className="w-full rounded-full border border-navy/10 bg-background py-3 pl-11 pr-4 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="relative">
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="w-full appearance-none rounded-full border border-navy/10 bg-background py-3 pl-5 pr-12 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 lg:w-56">
            <option value="all">Todas as categorias</option>
            {(categories.data ?? []).map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy" />
        </div>
        <div className="relative">
          <select value={level} onChange={(e) => setLevel(e.target.value as typeof level)} className="w-full appearance-none rounded-full border border-navy/10 bg-background py-3 pl-5 pr-12 text-sm font-semibold text-navy outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 lg:w-44">
            {LEVELS.map((l) => <option key={l.v} value={l.v}>{l.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy" />
        </div>
      </div>

      <div className="mt-8 space-y-10">
        {grouped.length === 0 && (
          <div className="rounded-[1.5rem] border border-dashed border-navy/20 bg-card/70 p-10 text-center text-sm text-muted-foreground">
            Nenhuma aula encontrada.
          </div>
        )}
        {grouped.map(([name, list]) => (
          <section key={name}>
            <div className="flex items-center gap-3">
              <div className="h-2 w-10 rounded-full bg-coral" />
              <h2 className="font-display text-xl font-extrabold text-navy">{name}</h2>
            </div>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((l) => {
                const p = (progress.data ?? []).find((x) => x.lesson_id === l.id);
                return <LessonCard key={l.id} lesson={l} completed={!!p?.completed} />;
              })}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
