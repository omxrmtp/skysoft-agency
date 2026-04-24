import { ClipboardList, PenTool, Code, Rocket } from "lucide-react";

const steps = [
  {
    icon: ClipboardList,
    title: "Briefing",
    desc: "Workshop de descubrimiento: objetivos, audiencia y métricas de éxito.",
  },
  {
    icon: PenTool,
    title: "Diseño",
    desc: "UX/UI a medida, sistema de diseño y prototipos interactivos validados.",
  },
  {
    icon: Code,
    title: "Desarrollo",
    desc: "Sprints semanales, código limpio y demos continuas con tu equipo.",
  },
  {
    icon: Rocket,
    title: "Lanzamiento",
    desc: "Despliegue, monitoreo, optimización post-launch y soporte continuo.",
  },
];

export function Process() {
  return (
    <section id="proceso" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl reveal">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary">
            / Proceso
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Cuatro pasos. <span className="text-brand">Cero sorpresas.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Una metodología probada que te mantiene informado en cada milestone.
          </p>
        </div>

        <div className="relative mt-16">
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-12 left-12 right-12 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            aria-hidden="true"
          />

          <ol className="grid lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="reveal relative"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="relative z-10 flex items-center justify-center h-24 w-24 rounded-2xl glass mx-auto">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-20" />
                  <s.icon className="relative h-9 w-9 text-primary" />
                  <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-elegant">
                    {i + 1}
                  </span>
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-display text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
