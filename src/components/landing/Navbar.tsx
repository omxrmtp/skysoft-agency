import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#servicios", label: "Servicios" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#proceso", label: "Proceso" },
  { href: "#contacto", label: "Contacto" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="container-x">
        <nav
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 md:px-6 h-14 transition-all",
            scrolled ? "glass shadow-card" : "bg-transparent"
          )}
          aria-label="Principal"
        >
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
              <Cloud className="h-4 w-4 text-primary-foreground" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight">
              Sky<span className="text-brand">Soft</span>
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/crm">
              <Button variant="glass" size="sm">CRM</Button>
            </Link>
            <a href="#contacto">
              <Button variant="hero" size="sm">Hablemos</Button>
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg glass"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile drawer */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-500",
            open ? "max-h-[420px] mt-3 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className="glass rounded-2xl p-5 flex flex-col gap-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-3 rounded-lg text-sm hover:bg-secondary/60 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Link to="/crm" className="contents">
                <Button variant="glass" className="w-full">CRM</Button>
              </Link>
              <a href="#contacto" className="contents">
                <Button variant="hero" className="w-full">Hablemos</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
