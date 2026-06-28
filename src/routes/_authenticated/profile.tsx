import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, CheckCircle2, User, ShieldCheck } from "lucide-react";
import { z } from "zod";
import profileVisual from "@/assets/profile-visual.png";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Meu perfil - English by Brigida" }] }),
  component: ProfilePage,
});

const nameSchema = z.string().trim().min(2, "Nome muito curto").max(80);
const passwordSchema = z.string().min(8, "Minimo de 8 caracteres").max(72);

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const profile = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (profile.data?.full_name) setName(profile.data.full_name);
  }, [profile.data?.full_name]);

  const completed = useQuery({
    queryKey: ["profile-completed", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("*, lessons(title, duration_minutes)")
        .eq("user_id", user!.id)
        .eq("completed", true);
      if (error) throw error;
      return data ?? [];
    },
  });

  const totalProgress = useQuery({
    queryKey: ["profile-progress-count", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const saveName = useMutation({
    mutationFn: async () => {
      const parsed = nameSchema.safeParse(name);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { error } = await supabase.from("profiles").update({ full_name: parsed.data }).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Nome atualizado");
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  const changePassword = useMutation({
    mutationFn: async (newPwd: string) => {
      const parsed = passwordSchema.safeParse(newPwd);
      if (!parsed.success) throw new Error(parsed.error.issues[0].message);
      const { error } = await supabase.auth.updateUser({ password: parsed.data });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Senha atualizada"),
    onError: (e: Error) => toast.error("Erro", { description: e.message }),
  });

  return (
    <AppShell>
      <section className="relative overflow-hidden rounded-[2rem] bg-navy text-card shadow-card">
        <img src={profileVisual} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/78 to-navy/18" />
        <div className="relative grid min-h-72 gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-card/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-card/70">
              <User className="h-3.5 w-3.5" />
              Meu perfil
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-4xl">Dados, acesso e progresso</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-card/72">
              Ajuste suas informacoes e acompanhe o que ja foi concluido dentro da plataforma.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-card/18 bg-card/92 px-6 py-5 text-navy shadow-soft backdrop-blur">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Conta</div>
            <div className="mt-1 text-sm font-bold">{user?.email}</div>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Dados pessoais">
          <label className="text-sm font-bold text-navy">Email</label>
          <input value={user?.email ?? ""} disabled className="mt-1.5 w-full rounded-xl border border-navy/10 bg-soft/60 px-4 py-3 text-sm" />

          <label className="mt-4 block text-sm font-bold text-navy">Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-navy/10 bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
          <button
            onClick={() => saveName.mutate()}
            disabled={saveName.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-coral-foreground shadow-soft transition hover:bg-coral/90 disabled:opacity-60"
          >
            {saveName.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Salvar
          </button>
        </Card>

        <Card title="Seguranca">
          <div className="mb-4 flex items-center gap-3 rounded-[1.25rem] bg-soft/70 p-4 text-sm text-navy">
            <ShieldCheck className="h-5 w-5 text-coral" />
            Altere sua senha sempre que precisar.
          </div>
          <PasswordForm onSubmit={(pwd) => changePassword.mutate(pwd)} pending={changePassword.isPending} />
        </Card>

        <Card title="Meu progresso">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Aulas iniciadas" value={totalProgress.data ?? 0} />
            <Metric label="Aulas concluidas" value={(completed.data ?? []).length} />
          </div>
        </Card>

        <Card title="Aulas concluidas">
          {(completed.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Voce ainda nao concluiu nenhuma aula.</p>
          ) : (
            <ul className="space-y-2">
              {(completed.data ?? []).map((c) => (
                <li key={c.id} className="flex items-center gap-2 rounded-xl bg-soft/50 px-3 py-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-coral" />
                  <span className="font-semibold text-navy">{c.lessons?.title}</span>
                  {c.lessons?.duration_minutes && <span className="text-muted-foreground">- {c.lessons.duration_minutes} min</span>}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-navy/10 bg-card/95 p-6 shadow-soft backdrop-blur">
      <h2 className="font-display text-lg font-extrabold text-navy">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.25rem] bg-navy p-4 text-card">
      <div className="text-xs font-bold uppercase tracking-[0.12em] text-card/62">{label}</div>
      <div className="mt-1 font-display text-3xl font-extrabold">{value}</div>
    </div>
  );
}

function PasswordForm({ onSubmit, pending }: { onSubmit: (pwd: string) => void; pending: boolean }) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const submit = () => {
    if (pwd !== confirm) return toast.error("Senhas nao conferem");
    onSubmit(pwd);
    setPwd("");
    setConfirm("");
  };
  return (
    <div className="space-y-3">
      <input type="password" placeholder="Nova senha" value={pwd} onChange={(e) => setPwd(e.target.value)} className="w-full rounded-xl border border-navy/10 bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30" />
      <input type="password" placeholder="Confirmar nova senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-xl border border-navy/10 bg-background px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30" />
      <button onClick={submit} disabled={pending || !pwd} className="inline-flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-sm font-bold text-navy-foreground shadow-soft transition hover:opacity-90 disabled:opacity-60">
        {pending && <Loader2 className="h-4 w-4 animate-spin" />} Atualizar senha
      </button>
    </div>
  );
}
