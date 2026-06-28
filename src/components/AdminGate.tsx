import { useIsAdmin } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading } = useIsAdmin(user?.id);
  if (loading || isLoading) {
    return <div className="text-sm text-muted-foreground">Verificando permissões...</div>;
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <ShieldAlert className="mx-auto h-10 w-10 text-coral" />
        <h2 className="mt-3 font-display text-xl font-bold text-navy">Acesso restrito</h2>
        <p className="mt-2 text-sm text-muted-foreground">Esta área é apenas para a professora/administradora.</p>
        <Link to="/dashboard" className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90">
          Ir para o dashboard
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
