import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabaseService";
import { ArrowLeft, Cloud } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/crm";

  const handleLoginSuccess = async (user: any) => {
    setIsLoading(false);
    toast({
      title: "¡Bienvenido!",
      description: "Has iniciado sesión correctamente.",
    });
    
    // Check if user has profile
    try {
      const profile = await supabaseService.getUserProfile(user.id);
      if (!profile) {
        // Create user profile if it doesn't exist
        await supabaseService.updateUserProfile(user.id, {
          nombre: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
          rol: 'admin',
          activo: true,
        });
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
    }

    navigate(from, { replace: true });
  };

  const handleLoginError = (error: string) => {
    setIsLoading(false);
    toast({
      title: "Error de inicio de sesión",
      description: error,
      variant: "destructive",
    });
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

        {/* Login card */}
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

          {/* Login form */}
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onLoginError={handleLoginError}
            className="w-full"
          />

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <a 
                href="mailto:contacto@skysoft.com" 
                className="font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Contacta con soporte
              </a>
            </p>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </div>
      </div>

      {/* Floating glow effects */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px] animate-float -z-10" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-accent/10 blur-[100px] animate-float -z-10" />
    </div>
  );
};

export default Login;
