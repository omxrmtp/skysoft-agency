import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Status = "Briefing" | "Diseño" | "Desarrollo" | "Lanzamiento";
type Project = {
  id: string;
  name: string;
  client: string;
  status: Status;
  budget: number;
  deadline: string;
};

// TODO: Replace with real data from Supabase
const seed: Project[] = [
  { id: "p1", name: "Plataforma SaaS Acme", client: "Acme Inc.", status: "Desarrollo", budget: 24000, deadline: "2025-06-12" },
  { id: "p2", name: "Tienda Romime", client: "Romime", status: "Diseño", budget: 12500, deadline: "2025-05-04" },
  { id: "p3", name: "App Paywave v2", client: "Paywave", status: "Briefing", budget: 38000, deadline: "2025-08-20" },
  { id: "p4", name: "Landing Groebult", client: "Groebult", status: "Lanzamiento", budget: 4800, deadline: "2025-04-30" },
  { id: "p5", name: "Marketplace Svanevst", client: "Svanevst", status: "Desarrollo", budget: 32000, deadline: "2025-07-18" },
];

const statusColors: Record<Status, string> = {
  Briefing: "bg-primary/15 text-primary border-primary/30",
  Diseño: "bg-accent/15 text-accent border-accent/30",
  Desarrollo: "bg-warning/15 text-warning border-warning/30",
  Lanzamiento: "bg-success/15 text-success border-success/30",
};

export function ProjectsView() {
  const [items, setItems] = useState(seed);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Status | "Todos">("Todos");
  const [editing, setEditing] = useState<Project | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    return items.filter((p) =>
      (filter === "Todos" || p.status === filter) &&
      (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.client.toLowerCase().includes(q.toLowerCase()))
    );
  }, [items, q, filter]);

  const openNew = () => {
    setEditing({
      id: "new",
      name: "",
      client: "",
      status: "Briefing",
      budget: 0,
      deadline: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditing({ ...p });
    setOpen(true);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim() || !editing.client.trim()) {
      toast.error("Nombre y cliente son obligatorios");
      return;
    }
    if (editing.id === "new") {
      setItems((p) => [{ ...editing, id: `p${Date.now()}` }, ...p]);
      toast.success("Proyecto creado");
    } else {
      setItems((p) => p.map((i) => (i.id === editing.id ? editing : i)));
      toast.success("Proyecto actualizado");
    }
    setOpen(false);
    setEditing(null);
  };

  const remove = (id: string) => {
    setItems((p) => p.filter((i) => i.id !== id));
    toast.success("Proyecto eliminado");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona, edita y crea nuevos proyectos.
          </p>
        </div>
        <Button variant="hero" onClick={openNew}>
          <Plus className="h-4 w-4" /> Nuevo proyecto
        </Button>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o cliente…"
            className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-primary/60"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(["Todos", "Briefing", "Diseño", "Desarrollo", "Lanzamiento"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-full border transition",
                filter === s
                  ? "bg-gradient-primary text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b border-border/60">
                <th className="text-left font-medium px-5 py-3">Proyecto</th>
                <th className="text-left font-medium px-5 py-3">Cliente</th>
                <th className="text-left font-medium px-5 py-3">Estado</th>
                <th className="text-right font-medium px-5 py-3">Presupuesto</th>
                <th className="text-left font-medium px-5 py-3">Entrega</th>
                <th className="text-right font-medium px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/30 transition">
                  <td className="px-5 py-4 font-medium">{p.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{p.client}</td>
                  <td className="px-5 py-4">
                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border", statusColors[p.status])}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums">
                    ${p.budget.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{p.deadline}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-primary transition"
                        aria-label="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => remove(p.id)}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-destructive transition"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                  Sin resultados.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {open && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-up">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-lg glass rounded-2xl p-6 shadow-elegant">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-xl font-bold">
                {editing.id === "new" ? "Nuevo proyecto" : "Editar proyecto"}
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-secondary/60"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <ModalField label="Nombre del proyecto">
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="modal-input"
                  placeholder="Plataforma SaaS Acme"
                  required
                />
              </ModalField>
              <ModalField label="Cliente">
                <input
                  value={editing.client}
                  onChange={(e) => setEditing({ ...editing, client: e.target.value })}
                  className="modal-input"
                  placeholder="Acme Inc."
                  required
                />
              </ModalField>
              <div className="grid grid-cols-2 gap-3">
                <ModalField label="Estado">
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value as Status })}
                    className="modal-input"
                  >
                    {(["Briefing", "Diseño", "Desarrollo", "Lanzamiento"] as Status[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </ModalField>
                <ModalField label="Presupuesto (USD)">
                  <input
                    type="number"
                    min={0}
                    value={editing.budget}
                    onChange={(e) => setEditing({ ...editing, budget: +e.target.value })}
                    className="modal-input"
                  />
                </ModalField>
              </div>
              <ModalField label="Fecha de entrega">
                <input
                  type="date"
                  value={editing.deadline}
                  onChange={(e) => setEditing({ ...editing, deadline: e.target.value })}
                  className="modal-input"
                />
              </ModalField>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button variant="hero" onClick={save}>
                {editing.id === "new" ? "Crear proyecto" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .modal-input {
          width: 100%;
          background: hsl(var(--secondary) / 0.5);
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s;
          color: hsl(var(--foreground));
        }
        .modal-input:focus { border-color: hsl(var(--primary) / 0.6); }
      `}</style>
    </div>
  );
}

function ModalField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
