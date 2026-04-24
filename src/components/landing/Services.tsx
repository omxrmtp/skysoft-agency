import { Code2, ShoppingBag, Smartphone, Check } from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Desarrollo Web",
    desc: "Sitios y plataformas a medida con stack moderno (React, Next.js, Node). Performance, SEO y escalabilidad de fábrica.",
    features: ["SSR / SSG", "Core Web Vitals", "Headless CMS"],
  },
  {
    icon: ShoppingBag,
    title: "E-commerce",
    desc: "Tiendas que venden. Integramos Shopify, Stripe y catálogos personalizados con UX optimizada para conversión.",
    features: ["Checkout 1-click", "Multi-pago", "Analítica avanzada"],
  },
  {
    icon: Smartphone,
    title: "Apps & SaaS",
    desc: "Aplicaciones móviles y web, dashboards SaaS y herramientas internas con autenticación, roles y APIs robustas.",
    features: ["iOS / Android", "Real-time", "API-first"],
  },
];

export function Services() {
  return (
    <section id="servicios" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="max-w-2xl reveal">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-primary">
            / Servicios
          </span>
          <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Tecnología que <span className="text-brand">acelera</span> tu crecimiento.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Tres líneas de servicio diseñadas para acompañarte desde la idea hasta el primer
            millón de usuarios.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <article
              key={s.title}
              className="reveal group relative glass card-glow rounded-2xl p-8 overflow-hidden"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              {/* gradient halo on hover */}
              <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-primary/0 group-hover:bg-primary/20 blur-3xl transition-all duration-700" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-accent/0 group-hover:bg-accent/20 blur-3xl transition-all duration-700" />

              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant">
                  <s.icon className="h-5 w-5 text-primary-foreground" />
                </div>

                <h3 className="mt-6 font-display text-2xl font-bold">{s.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.desc}</p>

                <ul className="mt-6 space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-border/60 flex items-center justify-between">
                  <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                  <span className="text-sm text-primary group-hover:translate-x-1 transition-transform">
                    Ver más →
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
