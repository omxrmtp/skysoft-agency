import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export function Hero() {
  return (
    <section className="relative pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10">
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          width={1536}
          height={1024}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        <div className="absolute inset-0 bg-grid" />
      </div>

      <div className="container-x">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full pl-2 pr-4 py-1.5 mb-8 reveal">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gradient-primary">
              <Sparkles className="h-3 w-3 text-primary-foreground" />
            </span>
            <span className="text-xs text-muted-foreground">
              Disponible para 3 nuevos proyectos en Q2
            </span>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 pulse-dot" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
          </div>

          <h1 className="reveal font-display text-5xl md:text-7xl lg:text-[88px] font-extrabold leading-[1.02] tracking-tighter">
            Construimos productos
            <br />
            <span className="text-brand animate-gradient bg-clip-text">digitales</span> que
            <br />
            <span className="text-gradient">escalan tu negocio.</span>
          </h1>

          <p className="reveal mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SkySoft es la agencia técnica que diseña, desarrolla y lanza experiencias web,
            e-commerce y apps de alto rendimiento — pensadas para convertir y crecer.
          </p>

          <div className="reveal mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#contacto">
              <Button variant="hero" size="xl" className="group">
                Iniciar mi proyecto
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="#portfolio">
              <Button variant="glass" size="xl">
                Ver portfolio
              </Button>
            </a>
          </div>

          {/* KPI strip */}
          <div className="reveal mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { v: "120+", l: "Proyectos lanzados" },
              { v: "98%", l: "Clientes satisfechos" },
              { v: "<1.2s", l: "TTI promedio" },
              { v: "8 años", l: "De experiencia" },
            ].map((k) => (
              <div key={k.l} className="glass rounded-xl px-4 py-5">
                <div className="font-display text-2xl md:text-3xl font-bold text-gradient">
                  {k.v}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{k.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-float -z-10" />
      <div className="pointer-events-none absolute top-1/3 right-10 h-[300px] w-[300px] rounded-full bg-accent/20 blur-[120px] animate-float -z-10" />
    </section>
  );
}
