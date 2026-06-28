import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { AdminTabs } from "./admin.index";
import { LessonForm } from "@/components/LessonForm";

export const Route = createFileRoute("/_authenticated/admin/lessons/new")({
  head: () => ({ meta: [{ title: "Nova aula — Admin" }] }),
  component: () => (
    <AppShell>
      <AdminGate><NewLesson /></AdminGate>
    </AppShell>
  ),
});

function NewLesson() {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="font-display text-3xl font-extrabold text-navy">Nova aula</h1>
      <p className="text-sm text-muted-foreground">Cadastre uma aula com vídeo, capa e materiais.</p>
      <AdminTabs />
      <LessonForm onDone={() => navigate({ to: "/admin/lessons" })} />
    </>
  );
}
