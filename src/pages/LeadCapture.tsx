import { useState } from "react";
import { Link } from "react-router-dom";
import { supabaseService } from "@/services/supabaseService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const LeadCapture = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    mensaje: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Crear lead en la base de datos
      await supabaseService.createLead({
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono || null,
        mensaje: formData.mensaje,
        servicio_id: null,
        estado_gestion: "nuevo",
      });

      setIsSubmitted(true);
      toast.success("¡Información enviada!", {
        description: "Nos pondremos en contacto contigo pronto.",
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      toast.error("Error al enviar", {
        description: "No pudimos procesar tu información. Intenta nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid" />
        
        <div className="relative w-full max-w-md mx-4">
          <div className="glass rounded-2xl p-8 shadow-elegant text-center">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4">¡Gracias por tu interés!</h2>
            <p className="text-muted-foreground mb-6">
              Hemos recibido tu información y nos pondremos en contacto contigo a la brevedad posible.
            </p>
            
            <Link to="/">
              <Button variant="hero" className="w-full">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-grid" />
      
      <div className="relative w-full max-w-md mx-4">
        {/* Back button */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Lead capture card */}
        <div className="glass rounded-2xl p-8 shadow-elegant">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
              <Cloud className="h-5 w-5 text-primary-foreground" />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight">
              Sky<span className="text-brand">Soft</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-4">
            Solicita información
          </h2>
          
          <p className="text-sm text-muted-foreground text-center mb-8">
            Cuéntanos sobre tu proyecto y te contactaremos para asesorarte.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo *
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange("nombre")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                id="correo"
                value={formData.correo}
                onChange={handleChange("correo")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                value={formData.telefono}
                onChange={handleChange("telefono")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="+51 987 654 321"
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                Describe tu proyecto *
              </label>
              <textarea
                id="mensaje"
                rows={4}
                value={formData.mensaje}
                onChange={handleChange("mensaje")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                placeholder="Estoy buscando desarrollar una aplicación web para..."
                required
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="hero" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar información"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Al enviar este formulario, aceptas que te contactemos para hablar sobre tu proyecto.
            </p>
            <div className="mt-2">
              <Link to="/login" className="text-xs text-primary hover:text-primary/80">
                ¿Eres administrador? Inicia sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating glow effects */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] animate-float -z-10" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px] animate-float -z-10" />
    </div>
  );
};

export default LeadCapture;
