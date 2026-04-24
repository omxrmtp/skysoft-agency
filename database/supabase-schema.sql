-- ===================================================================
-- SkySoft Agency - Supabase PostgreSQL Schema
-- ===================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ===================================================================
-- Categories Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- Projects Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS proyectos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    cliente VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    imagen_path VARCHAR(255),
    fecha_fin DATE,
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- Services Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS servicios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion_corta TEXT NOT NULL,
    icono_svg TEXT,
    precio_desde DECIMAL(10,2),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- Testimonials Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS testimonios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre_cliente VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    comentario TEXT NOT NULL,
    estrellas INTEGER NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    avatar_path VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- Leads Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    servicio_id UUID REFERENCES servicios(id) ON DELETE SET NULL,
    estado_gestion VARCHAR(20) DEFAULT 'nuevo' CHECK (estado_gestion IN ('nuevo', 'contactado', 'cerrado')),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- Users Table (using Supabase Auth)
-- ===================================================================
-- Note: Supabase handles user authentication through auth.users table
-- We'll create a profile table for additional user data
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(20) DEFAULT 'admin' CHECK (rol IN ('super_admin', 'admin', 'editor')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- CMS Configuration Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS configuracion_cms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    tipo VARCHAR(20) DEFAULT 'texto' CHECK (tipo IN ('texto', 'numero', 'boolean', 'json')),
    descripcion VARCHAR(255),
    editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- Indexes for Performance
-- ===================================================================
CREATE INDEX IF NOT EXISTS idx_categorias_slug ON categorias(slug);
CREATE INDEX IF NOT EXISTS idx_proyectos_categoria ON proyectos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_destacado ON proyectos(destacado);
CREATE INDEX IF NOT EXISTS idx_proyectos_fecha_fin ON proyectos(fecha_fin);
CREATE INDEX IF NOT EXISTS idx_servicios_estado ON servicios(estado);
CREATE INDEX IF NOT EXISTS idx_servicios_orden ON servicios(orden);
CREATE INDEX IF NOT EXISTS idx_testimonios_estado ON testimonios(estado);
CREATE INDEX IF NOT EXISTS idx_leads_correo ON leads(correo);
CREATE INDEX IF NOT EXISTS idx_leads_estado ON leads(estado_gestion);
CREATE INDEX IF NOT EXISTS idx_leads_fecha_registro ON leads(fecha_registro);
CREATE INDEX IF NOT EXISTS idx_leads_servicio ON leads(servicio_id);
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON configuracion_cms(clave);

-- ===================================================================
-- Triggers for updated_at timestamps
-- ===================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proyectos_updated_at BEFORE UPDATE ON proyectos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_testimonios_updated_at BEFORE UPDATE ON testimonios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion_cms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- Row Level Security (RLS) Policies
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonios ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_cms ENABLE ROW LEVEL SECURITY;

-- Public read access for categories, projects, services, testimonials
CREATE POLICY "Categorias - Public read access" ON categorias FOR SELECT USING (true);
CREATE POLICY "Proyectos - Public read access" ON proyectos FOR SELECT USING (true);
CREATE POLICY "Servicios - Public read access" ON servicios FOR SELECT USING (true);
CREATE POLICY "Testimonios - Public read access" ON testimonios FOR SELECT USING (true);

-- Leads can be inserted by anyone (contact forms) but only read by authenticated users
CREATE POLICY "Leads - Public insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Leads - Authenticated read" ON leads FOR SELECT USING (auth.role() = 'authenticated');

-- User profiles - users can only read/update their own profile
CREATE POLICY "User profiles - Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User profiles - Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Config - only authenticated users can read, only admins can write
CREATE POLICY "Config - Authenticated read" ON configuracion_cms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Config - Admin write" ON configuracion_cms FOR ALL USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() AND user_profiles.rol IN ('admin', 'super_admin')
    )
);

-- ===================================================================
-- Insert Default Data
-- ===================================================================

-- Default Categories
INSERT INTO categorias (nombre_categoria, slug) VALUES 
('Desarrollo Web', 'desarrollo-web'),
('Aplicaciones Móviles', 'aplicaciones-moviles'),
('E-commerce', 'e-commerce'),
('Marketing Digital', 'marketing-digital'),
('Consultoría TI', 'consultoria-ti');

-- Default Services
INSERT INTO servicios (titulo, descripcion_corta, precio_desde, estado, orden) VALUES 
('Desarrollo Web a Medida', 'Sitios web profesionales y personalizados con las últimas tecnologías', 1500.00, 'activo', 1),
('Tiendas Online', 'Plataformas e-commerce completas y funcionales', 2500.00, 'activo', 2),
('Aplicaciones Móviles', 'Apps nativas y multiplataforma para iOS y Android', 3500.00, 'activo', 3),
('SEO y Marketing', 'Posicionamiento y estrategias de marketing digital', 800.00, 'activo', 4),
('Consultoría Técnica', 'Asesoramiento experto para tu proyecto digital', 1200.00, 'activo', 5);

-- Default CMS Configuration
INSERT INTO configuracion_cms (clave, valor, tipo, descripcion) VALUES 
('site_title', 'SkySoft - Agencia de Desarrollo Web', 'texto', 'Título del sitio'),
('site_description', 'Agencia elite de desarrollo web y aplicaciones móviles', 'texto', 'Descripción del sitio'),
('site_keywords', 'desarrollo web, aplicaciones móviles, e-commerce, marketing digital', 'texto', 'Palabras clave SEO'),
('contact_email', 'contacto@skysoft.com', 'texto', 'Email de contacto'),
('contact_phone', '+1 (555) 123-4567', 'texto', 'Teléfono de contacto'),
('contact_address', '123 Tech Street, Silicon Valley, CA 94025', 'texto', 'Dirección de contacto'),
('social_facebook', 'https://facebook.com/skysoft', 'texto', 'URL de Facebook'),
('social_twitter', 'https://twitter.com/skysoft', 'texto', 'URL de Twitter'),
('social_linkedin', 'https://linkedin.com/company/skysoft', 'texto', 'URL de LinkedIn'),
('social_instagram', 'https://instagram.com/skysoft', 'texto', 'URL de Instagram'),
('maintenance_mode', 'false', 'boolean', 'Modo mantenimiento');

-- ===================================================================
-- Views for Common Queries
-- ===================================================================

-- Projects with Categories
CREATE OR REPLACE VIEW vista_proyectos_completos AS
SELECT 
    p.id,
    p.titulo,
    p.descripcion,
    p.cliente,
    p.url,
    p.imagen_path,
    p.fecha_fin,
    p.destacado,
    p.created_at,
    c.nombre_categoria,
    c.slug as categoria_slug
FROM proyectos p
INNER JOIN categorias c ON p.categoria_id = c.id;

-- Leads with Services
CREATE OR REPLACE VIEW vista_leads_completos AS
SELECT 
    l.id,
    l.nombre,
    l.correo,
    l.telefono,
    l.mensaje,
    l.estado_gestion,
    l.fecha_registro,
    l.ultima_actualizacion,
    s.titulo as servicio_nombre
FROM leads l
LEFT JOIN servicios s ON l.servicio_id = s.id;

-- ===================================================================
-- Functions for Dashboard Statistics
-- ===================================================================
CREATE OR REPLACE FUNCTION get_dashboard_statistics()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_leads', COUNT(*),
        'nuevos_leads', COUNT(CASE WHEN estado_gestion = 'nuevo' THEN 1 END),
        'contactados_leads', COUNT(CASE WHEN estado_gestion = 'contactado' THEN 1 END),
        'cerrados_leads', COUNT(CASE WHEN estado_gestion = 'cerrado' THEN 1 END),
        'total_proyectos', (SELECT COUNT(*) FROM proyectos),
        'proyectos_destacados', (SELECT COUNT(*) FROM proyectos WHERE destacado = true),
        'servicios_activos', (SELECT COUNT(*) FROM servicios WHERE estado = 'activo'),
        'testimonios_activos', (SELECT COUNT(*) FROM testimonios WHERE estado = 'activo')
    ) INTO result
    FROM leads;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
