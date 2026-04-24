import { Cloud, Github, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border/60 mt-12">
      <div className="container-x py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
                <Cloud className="h-4 w-4 text-primary-foreground" />
              </span>
              <span className="font-display text-lg font-extrabold">
                Sky<span className="text-brand">Soft</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Agencia técnica especializada en productos digitales de alto rendimiento.
              Diseño, código y crecimiento.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg glass hover:border-primary/40 transition-colors"
                  aria-label="social"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#servicios" className="hover:text-foreground">Desarrollo Web</a></li>
              <li><a href="#servicios" className="hover:text-foreground">E-commerce</a></li>
              <li><a href="#servicios" className="hover:text-foreground">Apps & SaaS</a></li>
              <li><a href="#servicios" className="hover:text-foreground">Consultoría</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#proceso" className="hover:text-foreground">Proceso</a></li>
              <li><a href="#portfolio" className="hover:text-foreground">Portfolio</a></li>
              <li><a href="#contacto" className="hover:text-foreground">Contacto</a></li>
              <li><a href="/crm" className="hover:text-foreground">CRM Interno</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} SkySoft. Todos los derechos reservados.</p>
          <p>Hecho con ♥ y código limpio.</p>
        </div>
      </div>
    </footer>
  );
}
