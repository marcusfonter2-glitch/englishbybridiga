import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import heroStudentImage from "@/assets/hero-student.png";

const searchSchema = z.object({
  mode: z.enum(["login", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Entrar - English by Brigida" }] }),
  component: AuthPage,
});

const signupSchema = z
  .object({
    full_name: z.string().trim().min(2, "Informe seu nome").max(80),
    email: z.string().trim().email("Email invalido").max(200),
    password: z.string().min(8, "Minimo de 8 caracteres").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Senhas nao conferem", path: ["confirm"] });

const loginSchema = z.object({
  email: z.string().trim().email("Email invalido"),
  password: z.string().min(1, "Informe a senha"),
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "signup">(mode === "signup" ? "signup" : "login");

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="drop-shadow-[0_10px_18px_rgba(11,47,107,0.18)]">
          <Logo />
        </Link>
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-full bg-card/80 px-4 py-2 text-sm font-semibold text-navy shadow-soft transition hover:bg-soft">
          <ArrowLeft className="h-4 w-4" /> Voltar ao site
        </Link>
      </div>

      <div className="mx-auto grid max-w-6xl items-stretch gap-6 px-4 pb-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden min-h-[650px] overflow-hidden rounded-[2rem] bg-navy text-card shadow-card lg:block">
          <img src={heroStudentImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/72 to-navy/18" />
          <div className="absolute inset-x-0 top-28 flex justify-center">
            <div className="inline-flex rounded-[1.5rem] bg-card/92 px-4 py-3 shadow-card backdrop-blur">
              <Logo size="lg" />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-16 p-10">
            <h1 className="font-display text-4xl font-extrabold leading-tight">Entre e continue sua rotina de ingles.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-card/76">
              Aulas por tema, progresso salvo e conteudo pronto para estudar no seu tempo.
            </p>
            <div className="mt-6 grid gap-3 text-sm font-semibold text-card/86">
              {["Acesso as aulas publicadas", "Progresso acompanhado", "Estude no celular ou computador"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-coral" /> {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-navy/10 bg-card/95 p-6 shadow-card backdrop-blur sm:p-9">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.16em] text-coral">Acesso</span>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-navy">{tab === "login" ? "Bem-vindo(a) de volta" : "Crie sua conta"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">Entre para continuar suas aulas ou comece agora.</p>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-1 rounded-full bg-soft p-1 text-sm font-bold">
              <button onClick={() => setTab("login")} className={`rounded-full py-2.5 transition ${tab === "login" ? "bg-navy text-navy-foreground shadow-soft" : "text-navy/70"}`}>
                Entrar
              </button>
              <button onClick={() => setTab("signup")} className={`rounded-full py-2.5 transition ${tab === "signup" ? "bg-coral text-coral-foreground shadow-soft" : "text-navy/70"}`}>
                Criar conta
              </button>
            </div>

            <div className="mt-6">
              {tab === "login" ? <LoginForm onDone={() => navigate({ to: "/dashboard" })} /> : <SignupForm onDone={() => navigate({ to: "/dashboard" })} />}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error("Nao foi possivel entrar", { description: error.message });
      return;
    }
    toast.success("Bem-vindo(a)!");
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
      <Field label="Senha" name="password" type="password" autoComplete="current-password" error={errors.password} />
      <div className="flex items-center justify-between text-sm">
        <label className="inline-flex items-center gap-2 text-muted-foreground">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input" /> Lembrar-me
        </label>
        <button type="button" onClick={() => toast.info("Em breve! Envie o pedido para a professora.")} className="font-semibold text-coral hover:underline">
          Esqueci minha senha
        </button>
      </div>
      <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-bold text-coral-foreground shadow-soft transition hover:bg-coral/90 disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Entrar
      </button>
    </form>
  );
}

function SignupForm({ onDone }: { onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = signupSchema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      password: fd.get("password"),
      confirm: fd.get("confirm"),
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errs[i.path[0] as string] = i.message));
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: { full_name: parsed.data.full_name },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setBusy(false);
    if (error) {
      toast.error("Nao foi possivel criar a conta", { description: error.message });
      return;
    }
    toast.success("Conta criada! Bem-vindo(a).");
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Nome completo" name="full_name" type="text" autoComplete="name" error={errors.full_name} />
      <Field label="Email" name="email" type="email" autoComplete="email" error={errors.email} />
      <Field label="Senha" name="password" type="password" autoComplete="new-password" error={errors.password} hint="Minimo de 8 caracteres" />
      <Field label="Confirmar senha" name="confirm" type="password" autoComplete="new-password" error={errors.confirm} />
      <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-navy-foreground shadow-soft transition hover:opacity-95 disabled:opacity-60">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />} Criar minha conta
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Ao criar uma conta voce concorda com nossos Termos e Politica de Privacidade.
      </p>
    </form>
  );
}

function Field({
  label, name, type, autoComplete, error, hint,
}: { label: string; name: string; type: string; autoComplete?: string; error?: string; hint?: string }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-bold text-navy">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        className={`mt-1.5 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-brand/40 ${
          error ? "border-destructive" : "border-navy/10 focus:border-brand"
        }`}
      />
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
