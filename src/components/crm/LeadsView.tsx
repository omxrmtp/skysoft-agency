import { useState } from "react";
import { Mail, Phone, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type LeadStatus = "Nuevo" | "En Proceso" | "Cerrado";
type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  status: LeadStatus;
  date: string;
  budget: string;
};

// TODO: Replace with real data from Supabase
const initial: Lead[] = [
  { id: "l1", name: "Marina Costa", company: "Lumen Studio", email: "marina@lumen.io", phone: "+34 612 345 678", message: "Necesitamos rediseñar nuestra plataforma SaaS y migrarla a Next.js.", status: "Nuevo", date: "Hace 2h", budget: "$25k - $50k" },
  { id: "l2", name: "Diego Rivera", company: "Holacasa", email: "diego@holacasa.mx", phone: "+52 55 8765 4321", message: "Buscamos una agencia para construir un marketplace de inmuebles.", status: "Nuevo", date: "Hace 5h", budget: "$60k+" },
  { id: "l3", name: "Sofía Pérez", company: "Verdejo Wines", email: "sofia@verdejo.es", phone: "+34 933 112 233", message: "Queremos lanzar un e-commerce internacional.", status: "En Proceso", date: "Ayer", budget: "$15k - $30k" },
  { id: "l4", name: "Lukas Müller", company: "Northwind", email: "l.mueller@nw.de", phone: "+49 30 1234 5678", message: "App móvil para gestión de flotas.", status: "En Proceso", date: "Hace 2 días", budget: "$40k" },
  { id: "l5", name: "Aiko Tanaka", company: "Sakura Tech", email: "aiko@sakura.jp", phone: "+81 3 1234 5678", message: "Landing page corporativa con CMS.", status: "Cerrado", date: "Hace 1 semana", budget: "$8k" },
  { id: "l6", name: "Pedro Souza", company: "BrasilFin", email: "pedro@brasilfin.br", phone: "+55 11 9876 5432", message: "Dashboard analítico para fintech.", status: "Cerrado", date: "Hace 2 semanas", budget: "$22k" },
];

const statusMeta: Record<LeadStatus, { label: string; chip: string; dot: string }> = {
  "Nuevo":     { label: "Nuevo",     chip: "bg-primary/15 text-primary border-primary/30",     dot: "bg-primary" },
  "En Proceso": { label: "En Proceso", chip: "bg-accent/15 text-accent border-accent/30",       dot: "bg-accent" },
  "Cerrado":   { label: "Cerrado",   chip: "bg-success/15 text-success border-success/30",   dot: "bg-success" },
};

export function LeadsView() {
  const [leads, setLeads] = useState(initial);
  const columns: LeadStatus[] = ["Nuevo", "En Proceso", "Cerrado"];

  const advance = (id: string) => {
    setLeads((all) =>
      all.map((l) => {
        if (l.id !== id) return l;
        const next: LeadStatus =
          l.status === "Nuevo" ? "En Proceso" : l.status === "En Proceso" ? "Cerrado" : "Nuevo";
        return { ...l, status: next };
      })
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Bandeja de Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mensajes de clientes potenciales clasificados por estado.
          </p>
        </div>
        <Button variant="hero">
          <Plus className="h-4 w-4" /> Añadir lead
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {columns.map((col) => {
          const list = leads.filter((l) => l.status === col);
          const meta = statusMeta[col];
          return (
            <section key={col} className="glass rounded-2xl p-4 flex flex-col">
              <header className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                  <h2 className="font-display font-bold text-sm">{meta.label}</h2>
                  <span className="text-xs text-muted-foreground">({list.length})</span>
                </div>
                <button className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-secondary/60 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </header>

              <div className="space-y-3 flex-1">
                {list.map((l) => (
                  <article
                    key={l.id}
                    className="group relative bg-surface-2/60 border border-border/60 rounded-xl p-4 hover:border-primary/40 transition cursor-pointer"
                    onClick={() => advance(l.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                        {l.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-medium truncate">{l.name}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{l.date}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{l.company} · {l.budget}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
                      "{l.message}"
                    </p>

                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <a href={`mailto:${l.email}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary">
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                        <a href={`tel:${l.phone}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] border", meta.chip)}>
                        {meta.label}
                      </span>
                    </div>
                  </article>
                ))}

                {list.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    Sin leads en esta etapa.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Tip: haz clic en una tarjeta para avanzarla al siguiente estado.
      </p>
    </div>
  );
}
