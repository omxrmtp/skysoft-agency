import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Tu nombre debe tener al menos 2 caracteres").max(80),
  email: z.string().trim().email("Introduce un email válido").max(160),
  message: z.string().trim().min(10, "Cuéntanos un poco más (mín. 10 caracteres)").max(800),
});

type FieldErrors = Partial<Record<keyof z.infer<typeof schema>, string>>;

export function Contact() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  const validateField = (key: keyof typeof values, val: string) => {
    const result = schema.shape[key].safeParse(val);
    setErrors((p) => ({ ...p, [key]: result.success ? undefined : result.error.issues[0].message }));
  };

  const onChange = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setValues((p) => ({ ...p, [key]: val }));
    if (touched[key]) validateField(key, val);
  };

  const onBlur = (key: keyof typeof values) => () => {
    setTouched((p) => ({ ...p, [key]: true }));
    validateField(key, values[key]);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(values);
    if (!result.success) {
      const fe: FieldErrors = {};
      result.error.issues.forEach((i) => (fe[i.path[0] as keyof FieldErrors] = i.message));
      setErrors(fe);
      setTouched({ name: true, email: true, message: true });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setValues({ name: "", email: "", message: "" });
      setTouched({});
      toast.success("¡Mensaje enviado!", { description: "Te contactaremos en menos de 24 h." });
    }, 900);
  };

  const fieldClass = (key: keyof typeof values) => {
    const ok = touched[key] && !errors[key] && values[key];
    const bad = touched[key] && errors[key];
    return [
      "w-full bg-secondary/40 border rounded-lg px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/60",
      "focus:bg-secondary/60",
      bad ? "border-destructive/60 focus:ring-2 focus:ring-destructive/30" :
      ok ? "border-success/60 focus:ring-2 focus:ring-success/30" :
      "border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/30",
    ].join(" ");
  };

  return (
    <section id="contacto" className="relative py-24 md:py-32">
      <div className="container-x">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="reveal">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-accent">
              / Contacto
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-bold tracking-tight">
              ¿Listo para construir algo <span className="text-brand">memorable</span>?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-md">
              Cuéntanos tu idea. Recibirás una propuesta clara, sin compromisos, en menos
              de 48 horas.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                "Respuesta garantizada en 24 h",
                "Estimación de tiempos y presupuesto inicial",
                "NDA disponible para tu tranquilidad",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <form
            onSubmit={onSubmit}
            noValidate
            className="reveal glass rounded-2xl p-6 md:p-8 space-y-5"
          >
            <Field
              label="Nombre"
              error={touched.name ? errors.name : undefined}
              valid={!!(touched.name && !errors.name && values.name)}
            >
              <input
                type="text"
                value={values.name}
                onChange={onChange("name")}
                onBlur={onBlur("name")}
                placeholder="Ada Lovelace"
                className={fieldClass("name")}
                required
                maxLength={80}
              />
            </Field>

            <Field
              label="Email"
              error={touched.email ? errors.email : undefined}
              valid={!!(touched.email && !errors.email && values.email)}
            >
              <input
                type="email"
                value={values.email}
                onChange={onChange("email")}
                onBlur={onBlur("email")}
                placeholder="ada@empresa.com"
                className={fieldClass("email")}
                required
                maxLength={160}
              />
            </Field>

            <Field
              label="Cuéntanos sobre tu proyecto"
              error={touched.message ? errors.message : undefined}
              valid={!!(touched.message && !errors.message && values.message)}
            >
              <textarea
                rows={5}
                value={values.message}
                onChange={onChange("message")}
                onBlur={onBlur("message")}
                placeholder="Estamos pensando en lanzar una plataforma SaaS para…"
                className={fieldClass("message") + " resize-none"}
                required
                maxLength={800}
              />
            </Field>

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Enviando…" : "Enviar mensaje"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  valid,
  children,
}: {
  label: string;
  error?: string;
  valid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium mb-2 flex items-center justify-between">
        <span>{label}</span>
        {error ? (
          <span className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {error}
          </span>
        ) : valid ? (
          <span className="text-xs text-success flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Perfecto
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
