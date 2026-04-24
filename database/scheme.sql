-- ===================================================================
-- SkySoft Agency - Database Schema
-- MySQL InnoDB with UTF8mb4 Character Set
-- ===================================================================

-- Create Database (uncomment if needed)
-- CREATE DATABASE skysoft_agency CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE skysoft_agency;

-- ===================================================================
-- Categories Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- Projects Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    cliente VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    imagen_path VARCHAR(255),
    fecha_fin DATE,
    destacado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
    INDEX idx_categoria (categoria_id),
    INDEX idx_destacado (destacado),
    INDEX idx_fecha_fin (fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- Services Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion_corta TEXT NOT NULL,
    icono_svg TEXT,
    precio_desde DECIMAL(10,2),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    orden INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- Testimonials Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS testimonios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    comentario TEXT NOT NULL,
    estrellas TINYINT NOT NULL CHECK (estrellas BETWEEN 1 AND 5),
    avatar_path VARCHAR(255),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_estrellas (estrellas)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- Leads Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    mensaje TEXT NOT NULL,
    servicio_id INT,
    estado_gestion ENUM('nuevo', 'contactado', 'cerrado') DEFAULT 'nuevo',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (servicio_id) REFERENCES servicios(id) ON DELETE SET NULL,
    INDEX idx_correo (correo),
    INDEX idx_estado (estado_gestion),
    INDEX idx_fecha_registro (fecha_registro),
    INDEX idx_servicio (servicio_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- Admin Users Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol ENUM('super_admin', 'admin', 'editor') DEFAULT 'admin',
    token_sesion VARCHAR(255),
    token_expira TIMESTAMP NULL,
    ultimo_login TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_token (token_sesion),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- CMS Configuration Table
-- ===================================================================
CREATE TABLE IF NOT EXISTS configuracion_cms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    tipo ENUM('texto', 'numero', 'boolean', 'json') DEFAULT 'texto',
    descripcion VARCHAR(255),
    editable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
INSERT INTO servicios (titulo, descripcion_corta, icono_svg, precio_desde, estado, orden) VALUES 
('Desarrollo Web a Medida', 'Sitios web profesionales y personalizados con las últimas tecnologías', '<svg>...</svg>', 1500.00, 'activo', 1),
('Tiendas Online', 'Plataformas e-commerce completas y funcionales', '<svg>...</svg>', 2500.00, 'activo', 2),
('Aplicaciones Móviles', 'Apps nativas y multiplataforma para iOS y Android', '<svg>...</svg>', 3500.00, 'activo', 3),
('SEO y Marketing', 'Posicionamiento y estrategias de marketing digital', '<svg>...</svg>', 800.00, 'activo', 4),
('Consultoría Técnica', 'Asesoramiento experto para tu proyecto digital', '<svg>...</svg>', 1200.00, 'activo', 5);

-- Default Admin User (password: admin123)
INSERT INTO usuarios_admin (nombre, email, password_hash, rol) VALUES 
('Administrador', 'admin@skysoft.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

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
('google_analytics', '', 'texto', 'Código de Google Analytics'),
('google_maps_api', '', 'texto', 'API Key de Google Maps'),
('maintenance_mode', 'false', 'boolean', 'Modo mantenimiento'),
('max_file_size', '5242880', 'numero', 'Tamaño máximo de archivo en bytes');

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
INNER JOIN categorias c ON p.categoria_id = c.id
WHERE p.id IS NOT NULL;

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
LEFT JOIN servicios s ON l.servicio_id = s.id
WHERE l.id IS NOT NULL;

-- ===================================================================
-- Stored Procedures for Common Operations
-- ===================================================================

DELIMITER //

-- Get Dashboard Statistics
CREATE PROCEDURE sp_dashboard_statistics()
BEGIN
    SELECT 
        COUNT(*) as total_leads,
        COUNT(CASE WHEN estado_gestion = 'nuevo' THEN 1 END) as nuevos_leads,
        COUNT(CASE WHEN estado_gestion = 'contactado' THEN 1 END) as contactados_leads,
        COUNT(CASE WHEN estado_gestion = 'cerrado' THEN 1 END) as cerrados_leads,
        (SELECT COUNT(*) FROM proyectos) as total_proyectos,
        (SELECT COUNT(*) FROM proyectos WHERE destacado = TRUE) as proyectos_destacados,
        (SELECT COUNT(*) FROM servicios WHERE estado = 'activo') as servicios_activos,
        (SELECT COUNT(*) FROM testimonios WHERE estado = 'activo') as testimonios_activos
    FROM leads;
END//

-- Get Latest Project
CREATE PROCEDURE sp_ultimo_proyecto()
BEGIN
    SELECT 
        p.id,
        p.titulo,
        p.descripcion,
        p.cliente,
        p.fecha_fin,
        c.nombre_categoria
    FROM proyectos p
    INNER JOIN categorias c ON p.categoria_id = c.id
    ORDER BY p.created_at DESC
    LIMIT 1;
END//

DELIMITER ;

-- ===================================================================
-- Triggers for Data Integrity
-- ===================================================================

-- Update leads ultima_actualizacion when estado_gestion changes
DELIMITER //
CREATE TRIGGER tr_leads_estado_update 
BEFORE UPDATE ON leads
FOR EACH ROW
BEGIN
    IF OLD.estado_gestion <> NEW.estado_gestion THEN
        SET NEW.ultima_actualizacion = CURRENT_TIMESTAMP;
    END IF;
END//
DELIMITER ;

-- ===================================================================
-- Index Optimization
-- ===================================================================

-- Composite indexes for performance
CREATE INDEX idx_proyectos_categoria_destacado ON proyectos(categoria_id, destacado);
CREATE INDEX idx_leads_estado_fecha ON leads(estado_gestion, fecha_registro);
CREATE INDEX idx_servicios_estado_orden ON servicios(estado, orden);

-- ===================================================================
-- Database Complete
-- ===================================================================
