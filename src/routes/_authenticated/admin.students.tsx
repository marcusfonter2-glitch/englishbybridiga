import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { AdminTabs } from "./admin.index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/students")({
  head: () => ({ meta: [{ title: "Alunos — Admin" }] }),
  component: () => (
    <AppShell>
      <AdminGate><Inner /></AdminGate>
    </AppShell>
  ),
});

function Inner() {
  const students = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold text-navy">Alunos</h1>
      <p className="text-sm text-muted-foreground">Lista de alunos cadastrados na plataforma.</p>
      <AdminTabs />

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Desde</th>
            </tr>
          </thead>
          <tbody>
            {(students.data ?? []).length === 0 && (
              <tr><td colSpan={2} className="px-4 py-10 text-center text-muted-foreground">Nenhum aluno cadastrado.</td></tr>
            )}
            {(students.data ?? []).map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold text-navy">{s.full_name || "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(s.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
