import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

type LessonRow = {
  id?: string;
  title: string;
  description: string | null;
  category_id: string | null;
  level: "basic" | "intermediate" | "advanced";
  duration_minutes: number | null;
  thumbnail_url: string | null;
  video_url: string | null;
  materials: string | null;
  status: "draft" | "published";
};

const schema = z.object({
  title: z.string().trim().min(2, "Informe um título").max(160),
  description: z.string().max(2000).optional().nullable(),
  category_id: z.string().uuid().nullable(),
  level: z.enum(["basic", "intermediate", "advanced"]),
  duration_minutes: z.number().int().min(0).max(600).nullable(),
  thumbnail_url: z.string().max(500).nullable(),
  video_url: z.string().min(1, "Informe o vídeo (upload ou URL)").max(1000),
  materials: z.string().max(5000).nullable(),
  status: z.enum(["draft", "published"]),
});

export function LessonForm({ initial, onDone }: { initial?: Partial<LessonRow>; onDone: () => void }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<LessonRow>({
    title: initial?.title ?? "",
    description: initial?.description ?? "",
    category_id: initial?.category_id ?? null,
    level: (initial?.level as LessonRow["level"]) ?? "basic",
    duration_minutes: initial?.duration_minutes ?? null,
    thumbnail_url: initial?.thumbnail_url ?? null,
    video_url: initial?.video_url ?? "",
    materials: initial?.materials ?? "",
    status: (initial?.status as LessonRow["status"]) ?? "draft",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  useEffect(() => { if (initial) setForm((f) => ({ ...f, ...initial } as LessonRow)); }, [initial?.id]);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
        setErrors(errs);
        throw new Error("Verifique os campos");
      }
      setErrors({});
      if (initial?.id) {
        const { error } = await supabase.from("lessons").update(parsed.data).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("lessons").insert({ ...parsed.data, created_by: user?.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(initial?.id ? "Aula atualizada" : "Aula criada");
      qc.invalidateQueries({ queryKey: ["admin-lessons"] });
      qc.invalidateQueries({ queryKey: ["lessons"] });
      onDone();
    },
    onError: (e: Error) => toast.error("Erro ao salvar", { description: e.message }),
  });

  const uploadFile = async (file: File, bucket: "lesson-videos" | "lesson-thumbnails") => {
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${user?.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    return path;
  };

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <Row>
          <Field label="Título" error={errors.title}>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
          </Field>
        </Row>
        <Row>
          <Field label="Descrição" error={errors.description}>
            <textarea rows={4} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
          </Field>
        </Row>
        <Row cols={3}>
          <Field label="Categoria">
            <select value={form.category_id ?? ""} onChange={(e) => setForm({ ...form, category_id: e.target.value || null })} className={inputCls}>
              <option value="">— sem categoria —</option>
              {(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Nível">
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as LessonRow["level"] })} className={inputCls}>
              <option value="basic">Básico</option>
              <option value="intermediate">Intermediário</option>
              <option value="advanced">Avançado</option>
            </select>
          </Field>
          <Field label="Duração (min)">
            <input type="number" min={0} value={form.duration_minutes ?? ""} onChange={(e) => setForm({ ...form, duration_minutes: e.target.value ? Number(e.target.value) : null })} className={inputCls} />
          </Field>
        </Row>

        <Row>
          <Field label="Vídeo — URL externa (YouTube, Vimeo, etc.) OU faça upload abaixo" error={errors.video_url}>
            <input value={form.video_url ?? ""} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." className={inputCls} />
          </Field>
        </Row>
        <div className="-mt-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-soft px-4 py-2 text-sm font-semibold text-navy hover:bg-soft/70">
            {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload de vídeo
            <input type="file" accept="video/*" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              try { setUploadingVideo(true); const path = await uploadFile(f, "lesson-videos"); setForm((p) => ({ ...p, video_url: path })); toast.success("Vídeo enviado"); }
              catch (err: unknown) { toast.error("Falha no upload", { description: err instanceof Error ? err.message : String(err) }); }
              finally { setUploadingVideo(false); }
            }} />
          </label>
          <p className="mt-1 text-xs text-muted-foreground">Para vídeos grandes prefira hospedagem externa (YouTube não listado, Vimeo, etc.) e cole a URL acima.</p>
        </div>

        <Row>
          <Field label="Thumbnail / capa — URL externa OU upload">
            <input value={form.thumbnail_url ?? ""} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." className={inputCls} />
          </Field>
        </Row>
        <div className="-mt-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-soft px-4 py-2 text-sm font-semibold text-navy hover:bg-soft/70">
            {uploadingThumb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload de capa
            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0]; if (!f) return;
              try { setUploadingThumb(true); const path = await uploadFile(f, "lesson-thumbnails"); setForm((p) => ({ ...p, thumbnail_url: path })); toast.success("Capa enviada"); }
              catch (err: unknown) { toast.error("Falha no upload", { description: err instanceof Error ? err.message : String(err) }); }
              finally { setUploadingThumb(false); }
            }} />
          </label>
        </div>

        <Row>
          <Field label="Materiais complementares (texto livre, links, instruções)">
            <textarea rows={5} value={form.materials ?? ""} onChange={(e) => setForm({ ...form, materials: e.target.value })} className={inputCls} />
          </Field>
        </Row>
      </div>

      <aside className="rounded-3xl border border-border bg-card p-6 shadow-soft h-fit lg:sticky lg:top-24">
        <h3 className="font-display text-base font-bold text-navy">Status</h3>
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-soft p-1 text-sm font-semibold">
          {(["draft", "published"] as const).map((s) => (
            <button key={s} onClick={() => setForm({ ...form, status: s })} className={`rounded-full py-2 transition ${form.status === s ? "bg-card text-navy shadow-soft" : "text-muted-foreground"}`}>
              {s === "draft" ? "Rascunho" : "Publicar"}
            </button>
          ))}
        </div>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground shadow-soft hover:opacity-90 disabled:opacity-60"
        >
          {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />} {initial?.id ? "Salvar alterações" : "Criar aula"}
        </button>
        <button onClick={onDone} className="mt-2 w-full rounded-full border border-input bg-card px-5 py-2.5 text-sm font-medium hover:bg-soft">
          Cancelar
        </button>
      </aside>
    </div>
  );
}

const inputCls =
  "mt-1 block w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

function Row({ children, cols = 1 }: { children: React.ReactNode; cols?: number }) {
  return <div className={`mt-4 grid gap-4 ${cols === 3 ? "sm:grid-cols-3" : ""}`}>{children}</div>;
}
function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
