import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabaseService } from "@/services/supabaseService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = true }: ProtectedRouteProps) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await supabaseService.getCurrentUser();
        setUser(currentUser);

        if (currentUser && adminOnly) {
          // Check user profile for admin role
          const profile = await supabaseService.getUserProfile(currentUser.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabaseService.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser && adminOnly) {
          const profile = await supabaseService.getUserProfile(currentUser.id);
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Verificando autorización...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role if required
  if (adminOnly) {
    const isAdmin = userProfile?.rol === 'admin' || userProfile?.rol === 'super_admin';
    const isYourEmail = user.email === 'brnmontes.pe@gmail.com';
    
    if (!isAdmin && !isYourEmail) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
            <p className="text-muted-foreground mb-6">
              Lo sentimos, no tienes permisos para acceder al CRM. 
              Si necesitas acceso, contacta al administrador.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
