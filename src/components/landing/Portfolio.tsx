import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import p4 from "@/assets/portfolio-4.jpg";
import p5 from "@/assets/portfolio-5.jpg";
import p6 from "@/assets/portfolio-6.jpg";

type Cat = "Todos" | "Web" | "E-commerce" | "App";

const projects = [
  { img: p1, title: "Nimbus Analytics", tag: "Dashboard SaaS para fintech", cat: "Web" as const },
  { img: p2, title: "Romime Fashion", tag: "Tienda omnicanal premium", cat: "E-commerce" as const },
  { img: p3, title: "Paywave", tag: "App fintech iOS / Android", cat: "App" as const },
  { img: p4, title: "Groebult", tag: "Landing corporativa SaaS", cat: "Web" as const },
  { img: p5, title: "Svanevst Store", tag: "Marketplace de electrónica", cat: "E-commerce" as const },
  { img: p6, title: "Fleetmove", tag: "App de logística en tiempo real", cat: "App" as const },
];

const filters: Cat[] = ["Todos", "Web", "E-commerce", "App"];

export function Portfolio() {
  const [active, setActive] = useState<Cat>("Todos");
  const list = useMemo(
    () => (active === "Todos" ? projects : projects.filter((p) => p.cat === active)),
    [active]
  );

  return (
    <section id="portfolio" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 reveal">
          <div className="max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent">
              / Portfolio
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight">
              Proyectos que <span className="text-brand">hablan</span> por nosotros.
            </h2>
          </div>

          <div className="glass inline-flex p-1.5 rounded-full self-start md:self-auto">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "px-4 py-2 text-sm rounded-full transition-all",
                  active === f
                    ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((p, i) => (
            <article
              key={p.title}
              className="reveal group relative overflow-hidden rounded-2xl glass card-glow"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={p.img}
                  alt={`Caso de estudio: ${p.title}`}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
                  {p.cat}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.tag}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
