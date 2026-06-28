import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { resolveVideoUrl, resolveThumbUrl, isYoutube, isVimeo, youtubeEmbed, vimeoEmbed } from "@/lib/video";
import { toast } from "sonner";
import { CheckCircle2, Clock, FileText, ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/lessons/$id")({
  head: () => ({ meta: [{ title: "Aula — English by Brígida" }] }),
  component: LessonPage,
});

function LessonPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [thumbSrc, setThumbSrc] = useState<string | null>(null);

  const lesson = useQuery({
    queryKey: ["lesson", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, categories(id, name, color, slug)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const related = useQuery({
    queryKey: ["lesson-related", lesson.data?.category_id, id],
    enabled: !!lesson.data?.category_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("id, title, duration_minutes, level")
        .eq("category_id", lesson.data!.category_id!)
        .eq("status", "published")
        .neq("id", id)
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
  });

  const progress = useQuery({
    queryKey: ["progress-one", user?.id, id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*")
        .eq("user_id", user!.id)
        .eq("lesson_id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!lesson.data?.video_url) { setVideoSrc(null); return; }
    resolveVideoUrl(lesson.data.video_url).then(setVideoSrc);
  }, [lesson.data?.video_url]);

  useEffect(() => {
    if (!lesson.data?.thumbnail_url) { setThumbSrc(null); return; }
    resolveThumbUrl(lesson.data.thumbnail_url).then(setThumbSrc);
  }, [lesson.data?.thumbnail_url]);

  const toggleComplete = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const completed = !progress.data?.completed;
      const { error } = await supabase
        .from("lesson_progress")
        .upsert(
          { user_id: user.id, lesson_id: id, completed, progress_pct: completed ? 100 : 0, last_watched_at: new Date().toISOString() },
          { onConflict: "user_id,lesson_id" }
        );
      if (error) throw error;
      return completed;
    },
    onSuccess: (completed) => {
      toast.success(completed ? "Aula marcada como concluída!" : "Marcação removida");
      queryClient.invalidateQueries({ queryKey: ["progress-one"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  if (lesson.isLoading) return <AppShell><div className="text-sm text-muted-foreground">Carregando aula...</div></AppShell>;
  if (!lesson.data) return <AppShell><div>Aula não encontrada.</div></AppShell>;

  const l = lesson.data;
  const levelLabel = l.level === "basic" ? "Básico" : l.level === "intermediate" ? "Intermediário" : "Avançado";

  return (
    <AppShell>
      <Link to="/library" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> Voltar à biblioteca
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
            <div className="aspect-video w-full bg-navy">
              {videoSrc ? (
                isYoutube(videoSrc) ? (
                  <iframe className="h-full w-full" src={youtubeEmbed(videoSrc)} title={l.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                ) : isVimeo(videoSrc) ? (
                  <iframe className="h-full w-full" src={vimeoEmbed(videoSrc)} title={l.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
                ) : (
                  <video className="h-full w-full" src={videoSrc} controls poster={thumbSrc ?? undefined} />
                )
              ) : (
                <div className="grid h-full w-full place-items-center text-navy-foreground/80">Vídeo indisponível</div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {l.categories && (
                <span className="rounded-full px-2.5 py-1 font-semibold" style={{ background: `${l.categories.color}22`, color: l.categories.color }}>
                  {l.categories.name}
                </span>
              )}
              <span className="rounded-full bg-soft px-2.5 py-1 font-semibold text-navy">{levelLabel}</span>
              {l.duration_minutes && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" /> {l.duration_minutes} min
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold text-navy">{l.title}</h1>
            {l.description && <p className="mt-3 text-muted-foreground">{l.description}</p>}

            {l.materials && (
              <div className="mt-6 rounded-2xl border border-border bg-card p-5">
                <h3 className="inline-flex items-center gap-2 font-display font-bold text-navy">
                  <FileText className="h-4 w-4" /> Materiais complementares
                </h3>
                <pre className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{l.materials}</pre>
              </div>
            )}

            <button
              onClick={() => toggleComplete.mutate()}
              disabled={toggleComplete.isPending}
              className={`mt-6 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-soft transition disabled:opacity-60 ${
                progress.data?.completed
                  ? "bg-teal text-teal-foreground hover:opacity-90"
                  : "bg-brand text-brand-foreground hover:opacity-90"
              }`}
            >
              {toggleComplete.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              <CheckCircle2 className="h-4 w-4" />
              {progress.data?.completed ? "Concluída ✓ (clique para desmarcar)" : "Marcar como concluída"}
            </button>
          </div>
        </div>

        <aside>
          <h3 className="font-display text-lg font-bold text-navy">Aulas relacionadas</h3>
          <div className="mt-3 space-y-2">
            {(related.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">Nenhuma aula relacionada.</p>}
            {(related.data ?? []).map((r) => (
              <Link key={r.id} to="/lessons/$id" params={{ id: r.id }} className="block rounded-xl border border-border bg-card p-3 transition hover:bg-soft">
                <div className="text-sm font-semibold text-navy">{r.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {r.level === "basic" ? "Básico" : r.level === "intermediate" ? "Intermediário" : "Avançado"}
                  {r.duration_minutes ? ` · ${r.duration_minutes} min` : ""}
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
