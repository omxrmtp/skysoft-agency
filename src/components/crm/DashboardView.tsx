import { ArrowDownRight, ArrowUpRight, DollarSign, Target, Users, Briefcase } from "lucide-react";

const stats = [
  { label: "Leads hoy", value: "24", delta: "+12%", up: true, icon: Users, hue: "primary" as const },
  { label: "Proyectos activos", value: "18", delta: "+3", up: true, icon: Briefcase, hue: "accent" as const },
  { label: "Tasa de conversión", value: "32%", delta: "+4.1%", up: true, icon: Target, hue: "primary" as const },
  { label: "Ingresos MRR", value: "$48.2k", delta: "-1.8%", up: false, icon: DollarSign, hue: "accent" as const },
];

const radials = [
  { label: "Briefing", value: 92, color: "primary" as const },
  { label: "Diseño", value: 76, color: "accent" as const },
  { label: "Desarrollo", value: 58, color: "primary" as const },
  { label: "Lanzamiento", value: 34, color: "accent" as const },
];

const recent = [
  { name: "Plataforma SaaS Acme", status: "En desarrollo", progress: 64, owner: "DM" },
  { name: "Tienda Romime", status: "Diseño", progress: 38, owner: "JR" },
  { name: "App Paywave v2", status: "Briefing", progress: 12, owner: "AL" },
  { name: "Landing Groebult", status: "Lanzamiento", progress: 92, owner: "VP" },
];

export function DashboardView() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Resumen del rendimiento de tu agencia hoy.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 relative overflow-hidden">
            <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-30 ${s.hue === "primary" ? "bg-primary" : "bg-accent"}`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                <p className={`mt-1 inline-flex items-center text-xs font-medium ${s.up ? "text-success" : "text-destructive"}`}>
                  {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {s.delta} <span className="text-muted-foreground ml-1 font-normal">vs ayer</span>
                </p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.hue === "primary" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold">Pipeline semanal</h3>
              <p className="text-xs text-muted-foreground">Leads por día (últimos 7 días)</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Nuevos</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Cerrados</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-7 gap-3 h-48 items-end">
            {[
              [55, 35], [70, 40], [40, 25], [85, 60], [65, 45], [90, 70], [50, 30],
            ].map(([a, b], i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="flex items-end gap-1 h-full w-full">
                  <div className="flex-1 rounded-t-md bg-gradient-to-t from-primary/40 to-primary" style={{ height: `${a}%` }} />
                  <div className="flex-1 rounded-t-md bg-gradient-to-t from-accent/40 to-accent" style={{ height: `${b}%` }} />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {["L","M","X","J","V","S","D"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Radial progress */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display font-bold">Etapas del pipeline</h3>
          <p className="text-xs text-muted-foreground">Distribución por fase</p>
          <div className="mt-6 space-y-5">
            {radials.map((r) => (
              <div key={r.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground">{r.label}</span>
                  <span className="font-medium">{r.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.color === "primary" ? "bg-gradient-to-r from-primary to-primary-glow" : "bg-gradient-to-r from-accent to-accent-glow"}`}
                    style={{ width: `${r.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent projects */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold">Proyectos recientes</h3>
          <span className="text-xs text-muted-foreground">Última semana</span>
        </div>
        <div className="space-y-3">
          {recent.map((p) => (
            <div key={p.name} className="flex items-center gap-4 p-3 rounded-xl hover:bg-secondary/40 transition">
              <div className="h-9 w-9 rounded-lg bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                {p.owner}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.status}</p>
              </div>
              <div className="hidden sm:block w-40">
                <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{p.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
