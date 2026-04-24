import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabaseService } from "@/services/supabaseService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Register = () => {
  const [formData, setFormData] = useState({
    email: "brnmontes.pe@gmail.com",
    password: "brayanmp123pp",
    name: "Brayan Montes",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Registrar usuario en Supabase Auth
      const { data, error } = await supabaseService.signUp(
        formData.email,
        formData.password,
        formData.name,
        'admin'
      );

      if (error) {
        if (error.message.includes('already registered')) {
          // Si el usuario ya existe, intentar hacer login
          const loginData = await supabaseService.signIn(formData.email, formData.password);
          toast.success("¡Bienvenido de nuevo!", {
            description: "Has iniciado sesión correctamente.",
          });
          navigate("/crm");
        } else {
          throw error;
        }
      } else {
        toast.success("¡Usuario creado!", {
          description: "Tu cuenta ha sido creada exitosamente.",
        });
        
        // Crear perfil de usuario
        if (data.user) {
          await supabaseService.updateUserProfile(data.user.id, {
            nombre: formData.name,
            rol: 'admin',
            activo: true,
          });
        }
        
        navigate("/crm");
      }
    } catch (error) {
      console.error('Error en registro:', error);
      toast.error("Error en el registro", {
        description: error instanceof Error ? error.message : "No se pudo crear el usuario",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* Register card */}
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

          <h2 className="text-2xl font-bold text-center mb-8">
            Crear cuenta de administrador
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 py-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              variant="hero" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta y acceder"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Floating glow effects */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] animate-float -z-10" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px] animate-float -z-10" />
    </div>
  );
};

export default Register;
