import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabaseService } from "@/services/supabaseService";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Cloud, CheckCircle, AlertCircle } from "lucide-react";

// Esta página solo debe existir en desarrollo
const Setup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const navigate = useNavigate();

  const createAdminUser = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // Usar la nueva función que maneja todo el proceso
      const authData = await supabaseService.createAdminUser(
        "brnmontes.pe@gmail.com",
        "brayanmp123pp",
        "Brayan Montes"
      );

      setResult({
        success: true,
        message: "Usuario administrador creado y sesión iniciada. Redirigiendo al CRM..."
      });
      
      // Redirigir después de un breve momento
      setTimeout(() => {
        navigate("/crm");
      }, 1500);
      
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      
      setResult({
        success: false,
        message: `Error: ${error.message || "No se pudo crear el usuario administrador"}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const authData = await supabaseService.signIn(
        "brnmontes.pe@gmail.com", 
        "brayanmp123pp"
      );

      if (authData.user) {
        setResult({
          success: true,
          message: "Login exitoso. Redirigiendo al CRM..."
        });
        
        setTimeout(() => {
          navigate("/crm");
        }, 1500);
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: `Error de login: ${error.message || "Credenciales incorrectas"}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Página no disponible</h1>
          <Link to="/">
            <Button variant="outline">Volver al inicio</Button>
          </Link>
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

        {/* Setup card */}
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
            Configuración de Administrador
          </h2>
          
          <p className="text-sm text-muted-foreground text-center mb-8">
            Esta página te ayuda a configurar tu usuario administrador para acceder al CRM.
          </p>

          {/* User info */}
          <div className="bg-secondary/50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Credenciales:</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> brnmontes.pe@gmail.com</p>
              <p><strong>Password:</strong> brayanmp123pp</p>
              <p><strong>Rol:</strong> Administrador</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              onClick={createAdminUser}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? "Creando usuario..." : "1. Crear usuario administrador"}
            </Button>

            <Button 
              onClick={testLogin}
              disabled={isLoading}
              className="w-full"
              variant="hero"
            >
              {isLoading ? "Iniciando sesión..." : "2. Probar login y acceder al CRM"}
            </Button>
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
              result.success ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}>
              {result.success ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm">{result.message}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Esta página solo está disponible en modo desarrollo.
            </p>
            <div className="mt-2 space-x-4">
              <Link to="/login" className="text-xs text-primary hover:text-primary/80">
                Ir al login
              </Link>
              <Link to="/register" className="text-xs text-primary hover:text-primary/80">
                Ir al registro
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

export default Setup;
