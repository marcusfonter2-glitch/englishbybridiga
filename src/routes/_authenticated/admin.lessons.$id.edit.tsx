import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { AdminTabs } from "./admin.index";
import { LessonForm } from "@/components/LessonForm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/lessons/$id/edit")({
  head: () => ({ meta: [{ title: "Editar aula — Admin" }] }),
  component: () => (
    <AppShell>
      <AdminGate><EditLesson /></AdminGate>
    </AppShell>
  ),
});

function EditLesson() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const lesson = useQuery({
    queryKey: ["admin-lesson", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("lessons").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold text-navy">Editar aula</h1>
      <p className="text-sm text-muted-foreground">Atualize os dados da aula.</p>
      <AdminTabs />
      {lesson.isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : lesson.data ? (
        <LessonForm initial={lesson.data} onDone={() => navigate({ to: "/admin/lessons" })} />
      ) : <p>Aula não encontrada.</p>}
    </>
  );
}
