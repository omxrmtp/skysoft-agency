import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Inbox,
  Users,
  Settings,
  Cloud,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabaseService } from "@/services/supabaseService";
import { useToast } from "@/hooks/use-toast";

type View = "dashboard" | "projects" | "leads";

const nav: { key: View; label: string; icon: typeof LayoutDashboard }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "projects", label: "Proyectos", icon: FolderKanban },
  { key: "leads", label: "Leads", icon: Inbox },
];

export function CrmShell({
  view,
  onChange,
  children,
}: {
  view: View;
  onChange: (v: View) => void;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabaseService.signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col sticky top-0 h-screen border-r border-border/60 bg-sidebar transition-[width] duration-300",
          collapsed ? "w-[78px]" : "w-[260px]"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border/60">
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
              <Cloud className="h-4 w-4 text-primary-foreground" />
            </span>
            {!collapsed && (
              <span className="font-display text-base font-extrabold whitespace-nowrap">
                Sky<span className="text-brand">Soft</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 mb-2">
              Workspace
            </p>
          )}
          {nav.map((item) => {
            const active = view === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all relative group",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r bg-gradient-primary" />
                )}
                <item.icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}

          {!collapsed && (
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 mt-6 mb-2">
              Equipo
            </p>
          )}
          {[
            { label: "Clientes", icon: Users, action: () => toast({ title: "Clientes", description: "Vista de clientes en desarrollo" }) },
            { label: "Ajustes", icon: Settings, action: () => toast({ title: "Ajustes", description: "Configuración en desarrollo" }) },
          ].map((i) => (
            <button
              key={i.label}
              onClick={i.action}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
            >
              <i.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{i.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-border/60">
          {!collapsed && (
            <div className="glass rounded-xl p-3 mb-3">
              <p className="text-xs font-medium">Plan Pro</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Renovación 12 abr.
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: "72%" }} />
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
            aria-label="Colapsar sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : (
              <>
                <ChevronLeft className="h-4 w-4" /> Colapsar
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-4 inset-x-4 z-40 glass rounded-2xl p-1.5 flex justify-around">
        {nav.map((item) => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              className={cn(
                "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[10px] transition",
                active ? "bg-secondary text-foreground" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-primary")} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="h-full px-5 md:px-8 flex items-center gap-4">
            <Link
              to="/"
              className="md:hidden flex items-center gap-2"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Cloud className="h-4 w-4 text-primary-foreground" />
              </span>
            </Link>

            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Buscar proyectos, leads, clientes…"
                className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/60 focus:bg-secondary"
              />
            </div>

            <button className="relative h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-secondary/60">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary pulse-dot" />
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-border/60">
              <div className="hidden sm:block text-right leading-tight">
                <p className="text-xs font-medium">Usuario CRM</p>
                <p className="text-[10px] text-muted-foreground">Administrador</p>
              </div>
              <div className="relative group">
                <div className="h-9 w-9 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-elegant cursor-pointer">
                  U
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg shadow-elegant opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 pb-28 md:pb-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
