import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AdminGate } from "@/components/AdminGate";
import { AdminTabs } from "./admin.index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  head: () => ({ meta: [{ title: "Categorias — Admin" }] }),
  component: () => (
    <AppShell>
      <AdminGate><Inner /></AdminGate>
    </AppShell>
  ),
});

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(60),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e -"),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use formato #RRGGBB"),
  sort_order: z.number().int().min(0),
});

function Inner() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#1266D6");
  const [sortOrder, setSortOrder] = useState(99);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ name, slug, description, color, sort_order: sortOrder });
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { error } = await supabase.from("categories").insert(parsed.data);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Categoria criada");
      setName(""); setSlug(""); setDescription("");
      qc.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Categoria excluída"); qc.invalidateQueries({ queryKey: ["categories"] }); },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold text-navy">Categorias</h1>
      <p className="text-sm text-muted-foreground">Crie e organize categorias de aulas.</p>
      <AdminTabs />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
          <table className="w-full text-sm">
            <thead className="bg-soft text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Ordem</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Cor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(categories.data ?? []).map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="px-4 py-3 text-muted-foreground">{c.sort_order}</td>
                  <td className="px-4 py-3 font-semibold text-navy">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                  <td className="px-4 py-3"><span className="inline-block h-5 w-10 rounded" style={{ background: c.color }} /></td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm(`Excluir "${c.name}"?`)) remove.mutate(c.id); }}
                      className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15">
                      <Trash2 className="h-3 w-3" /> Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="h-fit rounded-3xl border border-border bg-card p-6 shadow-soft">
          <h3 className="font-display text-base font-bold text-navy">Nova categoria</h3>
          <div className="mt-4 space-y-3">
            <Input label="Nome" value={name} onChange={(v) => { setName(v); if (!slug) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }} />
            <Input label="Slug" value={slug} onChange={setSlug} />
            <Input label="Descrição" value={description} onChange={setDescription} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Cor (#hex)" value={color} onChange={setColor} />
              <Input label="Ordem" value={String(sortOrder)} onChange={(v) => setSortOrder(Number(v) || 0)} type="number" />
            </div>
            <button onClick={() => create.mutate()} disabled={create.isPending} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90 disabled:opacity-60">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Criar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Input({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-navy">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/30" />
    </div>
  );
}
