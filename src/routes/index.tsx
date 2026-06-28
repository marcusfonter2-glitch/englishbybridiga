import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import courseDeskImage from "@/assets/course-desk.png";
import heroStudentImage from "@/assets/hero-student.png";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Headphones,
  Layers,
  MessagesSquare,
  Mic,
  PenLine,
  PlayCircle,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "English by Brígida | Aprenda inglês no seu ritmo" },
      { name: "description", content: "Aulas gravadas de inglês organizadas por categorias. Gramática, conversação, vocabulário, pronúncia e mais." },
      { property: "og:title", content: "English by Brígida" },
      { property: "og:description", content: "Plataforma de aulas de inglês para estudar no seu ritmo." },
    ],
  }),
  component: Landing,
});

const benefits = [
  { icon: BookOpen, title: "Grammar", desc: "Estruturas claras e exemplos do dia a dia." },
  { icon: Sparkles, title: "Vocabulary", desc: "Palavras e expressões que você realmente usa." },
  { icon: MessagesSquare, title: "Conversation", desc: "Diálogos e prática para falar com confiança." },
  { icon: Mic, title: "Pronunciation", desc: "Sons, ritmo e entonação naturais." },
  { icon: Headphones, title: "Listening", desc: "Treine o ouvido com áudios reais." },
  { icon: PenLine, title: "Writing", desc: "Escreva textos claros e corretos." },
];

const method = [
  { icon: PlayCircle, title: "Aulas gravadas", desc: "Assista quantas vezes quiser, quando quiser." },
  { icon: Layers, title: "Organizadas por categoria", desc: "Encontre rápido o tema que você precisa estudar." },
  { icon: Clock, title: "No seu ritmo", desc: "Estude 10 minutos ou 1 hora. Você decide." },
  { icon: GraduationCap, title: "Trilha clara", desc: "Do básico ao avançado, do seu jeito." },
];

const benefitStyles = [
  "bg-navy text-navy-foreground",
  "bg-card text-navy ring-1 ring-navy/15",
  "bg-coral text-coral-foreground",
  "bg-brand text-brand-foreground",
  "bg-soft text-navy ring-1 ring-navy/10",
  "bg-navy text-navy-foreground",
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto mt-4 flex h-16 max-w-6xl items-center justify-between rounded-full border border-card/60 bg-card/90 px-4 shadow-soft backdrop-blur sm:px-5">
          <Logo />
          <nav className="flex items-center gap-2">
            <Link to="/auth" className="hidden rounded-full px-4 py-2 text-sm font-semibold text-navy transition hover:bg-soft sm:inline-flex">
              Entrar
            </Link>
            <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center gap-1.5 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-coral-foreground shadow-soft transition hover:bg-coral/90">
              Criar conta <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative min-h-screen overflow-hidden pt-28 text-card">
        <img
          src={heroStudentImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/76 to-navy/18" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-center gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:justify-start">
              <div className="grid h-32 w-72 place-items-center rounded-full border border-card/70 bg-card/95 px-8 shadow-card backdrop-blur sm:h-36 sm:w-80">
                <Logo size="xl" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-card/25 bg-card/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-card backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-coral" />
              Plataforma oficial de aulas
            </div>

            <h1 className="mt-7 max-w-3xl font-display text-4xl font-extrabold leading-[1.02] text-card sm:text-5xl lg:text-6xl">
              Inglês com direção, prática e rotina leve.
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-card/82 lg:mx-0">
              Com a English by Brígida, você estuda em vídeos curtinhos, separados por tema e nível. Do básico ao avançado, no seu ritmo.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link to="/auth" className="inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-bold text-navy shadow-card transition hover:bg-soft">
                Entrar na plataforma <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-bold text-coral-foreground shadow-card transition hover:bg-coral/90">
                Criar conta grátis
              </Link>
            </div>

            <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-sm text-card/80 sm:grid-cols-3 lg:mx-0">
              {["Acesso vitalício às aulas", "Estude no celular ou desktop", "Conteúdo novo toda semana"].map((item) => (
                <span key={item} className="flex items-center gap-2 rounded-full bg-card/10 px-3 py-2 backdrop-blur">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-coral" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>
      </section>

      <section className="relative -mt-10 pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-5 rounded-[2rem] border border-navy/10 bg-card/95 p-4 shadow-card backdrop-blur md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-navy p-6 text-navy-foreground">
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-card/70">Comece por aqui</div>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-card">Aula em destaque</h2>
              <p className="mt-3 text-sm leading-6 text-card/72">
                Present Simple sem mistério: quando usar, como formar e os erros mais comuns.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] md:col-span-2">
              <img src={courseDeskImage} alt="" className="h-full min-h-64 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/25 to-transparent" />
              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold text-navy shadow-soft">
                <PlayCircle className="h-4 w-4 text-coral" />
                12 min
              </div>
              <div className="absolute bottom-5 left-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-coral px-3 py-1 text-xs font-bold text-coral-foreground">Grammar</span>
                <span className="rounded-full bg-card px-3 py-1 text-xs font-bold text-navy">Básico</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-coral">Método</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-navy sm:text-4xl">Um método simples que funciona</h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Sem complicação. Você assiste, pratica e revisa quando quiser.
              </p>
            </div>

            <div className="grid gap-4">
              {method.map(({ icon: Icon, title, desc }, index) => (
                <div key={title} className="group grid gap-5 rounded-[1.75rem] border border-navy/10 bg-card p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-card sm:grid-cols-[auto_1fr]">
                  <div className={`${index % 2 === 0 ? "bg-navy text-navy-foreground" : "bg-coral text-coral-foreground"} grid h-14 w-14 place-items-center rounded-2xl transition group-hover:scale-105`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Passo {index + 1}</div>
                    <h3 className="mt-1 font-display text-xl font-extrabold text-navy">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-navy py-20 text-navy-foreground">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-sm font-bold uppercase tracking-[0.18em] text-coral">Currículo</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-card sm:text-4xl">O que você vai estudar</h2>
            </div>
            <p className="max-w-md text-card/72">
              Conteúdo organizado em categorias para você ir direto ao ponto.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map(({ icon: Icon, title, desc }, index) => (
              <div key={title} className="rounded-[1.75rem] border border-card/14 bg-card/8 p-5 shadow-soft backdrop-blur transition hover:-translate-y-1 hover:bg-card/12">
                <div className="flex items-center gap-3">
                  <div className={`grid h-11 w-11 place-items-center rounded-2xl ${benefitStyles[index % benefitStyles.length]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-xl font-extrabold text-card">{title}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-card/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-card p-8 shadow-card sm:p-10">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-coral/15 blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">
              <div>
                <span className="text-sm font-bold uppercase tracking-[0.18em] text-coral">Próximo passo</span>
                <h3 className="mt-3 font-display text-3xl font-extrabold text-navy sm:text-4xl">Pronto para começar a estudar hoje?</h3>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  Crie sua conta grátis e tenha acesso imediato à biblioteca de aulas.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-bold text-coral-foreground shadow-soft transition hover:bg-coral/90">
                  Criar minha conta <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/auth" className="inline-flex items-center gap-2 rounded-full border border-navy bg-card px-6 py-3 text-sm font-bold text-navy transition hover:bg-soft">
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} English by Brígida. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
