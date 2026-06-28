import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { AdminTabs } from "./admin.index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/lessons/")({
  head: () => ({ meta: [{ title: "Aulas — Admin" }] }),
  component: () => (
    <AppShell>
      <AdminGate><Inner /></AdminGate>
    </AppShell>
  ),
});

function Inner() {
  const qc = useQueryClient();
  const lessons = useQuery({
    queryKey: ["admin-lessons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*, categories(name, color)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("lessons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Aula excluída"); qc.invalidateQueries({ queryKey: ["admin-lessons"] }); },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-navy">Aulas</h1>
          <p className="text-sm text-muted-foreground">Cadastre, edite e publique aulas.</p>
        </div>
        <Link to="/admin/lessons/new" className="inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-coral-foreground shadow-soft hover:opacity-90">
          <Plus className="h-4 w-4" /> Nova aula
        </Link>
      </div>
      <AdminTabs />

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Nível</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(lessons.data ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Nenhuma aula cadastrada ainda.</td></tr>
            )}
            {(lessons.data ?? []).map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3 font-semibold text-navy">{l.title}</td>
                <td className="px-4 py-3">
                  {l.categories ? (
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: `${l.categories.color}22`, color: l.categories.color }}>
                      {l.categories.name}
                    </span>
                  ) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {l.level === "basic" ? "Básico" : l.level === "intermediate" ? "Intermediário" : "Avançado"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${l.status === "published" ? "bg-teal/15 text-teal" : "bg-gold/20 text-gold-foreground"}`}>
                    {l.status === "published" ? "Publicada" : "Rascunho"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-2">
                    <Link to="/admin/lessons/$id/edit" params={{ id: l.id }} className="inline-flex items-center gap-1 rounded-full bg-soft px-3 py-1.5 text-xs font-semibold text-navy hover:bg-soft/70">
                      <Pencil className="h-3 w-3" /> Editar
                    </Link>
                    <button
                      onClick={() => { if (confirm(`Excluir "${l.title}"?`)) del.mutate(l.id); }}
                      className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15"
                    >
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
