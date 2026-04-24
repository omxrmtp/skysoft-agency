<?php

declare(strict_types=1);

/**
 * SkySoft API - Main Entry Point
 * 
 * RESTful API for SkySoft Agency
 * Handles all incoming requests and routes them to appropriate controllers
 */

// Load configuration
require_once __DIR__ . '/config/config.php';

// Import required classes
use SkySoft\Router\Router;
use SkySoft\Controllers\ProjectController;
use SkySoft\Controllers\LeadController;
use SkySoft\Controllers\AuthController;
use SkySoft\Controllers\CrmController;

// Create router instance
$router = new Router();

// ===================================================================
// Public Routes (No Authentication Required)
// ===================================================================

// Health check
$router->get('/health', function() {
    successResponse('API is healthy', [
        'version' => API_VERSION,
        'timestamp' => date('Y-m-d H:i:s'),
        'environment' => APP_ENV
    ]);
});

// Projects - Public access
$router->get('/projects', [ProjectController::class, 'getAll']);
$router->get('/projects/featured', [ProjectController::class, 'getFeatured']);
$router->get('/projects/category/{slug}', [ProjectController::class, 'getByCategory']);
$router->get('/projects/{id}', [ProjectController::class, 'getById']);

// Services - Public access
$router->get('/services', function() {
    $services = Database::fetchAll("
        SELECT id, titulo, descripcion_corta, icono_svg, precio_desde, estado, orden
        FROM servicios 
        WHERE estado = 'activo'
        ORDER BY orden ASC, titulo ASC
    ");
    successResponse('Services retrieved successfully', $services);
});

// Categories - Public access
$router->get('/categories', function() {
    $categories = Database::fetchAll("
        SELECT id, nombre_categoria, slug
        FROM categorias
        ORDER BY nombre_categoria ASC
    ");
    successResponse('Categories retrieved successfully', $categories);
});

// Testimonials - Public access
$router->get('/testimonials', function() {
    $limit = (int)($_GET['limit'] ?? 10);
    $testimonials = Database::fetchAll("
        SELECT id, nombre_cliente, cargo, comentario, estrellas, avatar_path
        FROM testimonios 
        WHERE estado = 'activo'
        ORDER BY created_at DESC
        LIMIT ?
    ", [$limit]);
    successResponse('Testimonials retrieved successfully', $testimonials);
});

// CMS Configuration - Public access
$router->get('/config', function() {
    $config = Database::fetchAll("
        SELECT clave, valor, tipo
        FROM configuracion_cms
        WHERE editable = true
    ");
    
    // Convert to associative array
    $configArray = [];
    foreach ($config as $item) {
        $configArray[$item['clave']] = $item['tipo'] === 'boolean' 
            ? filter_var($item['valor'], FILTER_VALIDATE_BOOLEAN)
            : ($item['tipo'] === 'numero' 
                ? (float)$item['valor'] 
                : $item['valor']);
    }
    
    successResponse('Configuration retrieved successfully', $configArray);
});

// Lead submission - Public access
$router->post('/leads', [LeadController::class, 'create']);

// ===================================================================
// Authentication Routes
// ===================================================================

$router->post('/auth/login', [AuthController::class, 'login']);
$router->post('/auth/logout', [AuthController::class, 'logout']);

// Authenticated user info
$router->get('/auth/me', [AuthController::class, 'me']);
$router->post('/auth/refresh', [AuthController::class, 'refresh']);
$router->post('/auth/change-password', [AuthController::class, 'changePassword']);

// ===================================================================
// Protected Routes (Authentication Required)
// ===================================================================

// Group authenticated routes
$router->group([\SkySoft\Middleware\AuthMiddleware::class], function($router) {
    
    // CRM Dashboard
    $router->get('/crm/dashboard', [CrmController::class, 'getDashboard']);
    $router->get('/crm/activity', [CrmController::class, 'getActivityFeed']);
    $router->get('/crm/performance', [CrmController::class, 'getPerformanceMetrics']);
    $router->get('/crm/quick-actions', [CrmController::class, 'getQuickActions']);
    $router->get('/crm/export', [CrmController::class, 'exportDashboard']);
    
    // Leads Management
    $router->get('/leads', [LeadController::class, 'getAll']);
    $router->get('/leads/recent', [LeadController::class, 'getRecent']);
    $router->get('/leads/stats', [LeadController::class, 'getStats']);
    $router->get('/leads/export', [LeadController::class, 'export']);
    $router->get('/leads/{id}', [LeadController::class, 'getById']);
    $router->put('/leads/{id}/status', [LeadController::class, 'updateStatus']);
    $router->delete('/leads/{id}', [LeadController::class, 'delete']);
    
    // Projects Management
    $router->post('/projects', [ProjectController::class, 'create']);
    $router->put('/projects/{id}', [ProjectController::class, 'update']);
    $router->delete('/projects/{id}', [ProjectController::class, 'delete']);
    $router->get('/projects/stats', [ProjectController::class, 'getStats']);
    
    // Services Management
    $router->get('/services/all', function() {
        $services = Database::fetchAll("
            SELECT id, titulo, descripcion_corta, icono_svg, precio_desde, estado, orden, created_at
            FROM servicios 
            ORDER BY orden ASC, titulo ASC
        ");
        successResponse('All services retrieved successfully', $services);
    });
    
    // Categories Management
    $router->get('/categories/all', function() {
        $categories = Database::fetchAll("
            SELECT id, nombre_categoria, slug, created_at, updated_at
            FROM categorias
            ORDER BY nombre_categoria ASC
        ");
        successResponse('All categories retrieved successfully', $categories);
    });
    
    // Testimonials Management
    $router->get('/testimonials/all', function() {
        $testimonials = Database::fetchAll("
            SELECT id, nombre_cliente, cargo, comentario, estrellas, avatar_path, estado, created_at
            FROM testimonios 
            ORDER BY created_at DESC
        ");
        successResponse('All testimonials retrieved successfully', $testimonials);
    });
    
    // CMS Configuration Management
    $router->get('/config/all', function() {
        $config = Database::fetchAll("
            SELECT id, clave, valor, tipo, descripcion, editable, created_at, updated_at
            FROM configuracion_cms
            ORDER BY clave ASC
        ");
        successResponse('All configuration retrieved successfully', $config);
    });
});

// ===================================================================
// Admin Routes (Admin Role Required)
// ===================================================================

// Group admin routes
$router->group([\SkySoft\Middleware\AuthMiddleware::class], function($router) {
    
    // User Management
    $router->get('/users', [AuthController::class, 'getUsers']);
    $router->post('/users', [AuthController::class, 'createUser']);
    $router->put('/users/{id}/status', [AuthController::class, 'updateUserStatus']);
    $router->delete('/users/{id}', [AuthController::class, 'deleteUser']);
    
    // Service CRUD
    $router->post('/services', function() {
        // Get and validate input
        $data = Router::requireParams(['titulo', 'descripcion_corta']);
        $data = Router::validateTypes([
            'titulo' => 'string',
            'descripcion_corta' => 'string',
            'icono_svg' => 'string',
            'precio_desde' => 'float',
            'estado' => 'string',
            'orden' => 'int'
        ], $data);
        
        // Prepare service data
        $serviceData = [
            'titulo' => $data['titulo'],
            'descripcion_corta' => $data['descripcion_corta'],
            'icono_svg' => $data['icono_svg'] ?? null,
            'precio_desde' => $data['precio_desde'] ?? null,
            'estado' => $data['estado'] ?? 'activo',
            'orden' => $data['orden'] ?? 0
        ];
        
        // Insert service
        $serviceId = Database::insert('servicios', $serviceData);
        
        if (!$serviceId) {
            errorResponse('Failed to create service', 500);
        }
        
        successResponse('Service created successfully', ['id' => $serviceId]);
    });
    
    $router->put('/services/{id}', function($params) {
        $id = (int)$params['id'];
        
        if ($id <= 0) {
            errorResponse('Invalid service ID', 400);
        }
        
        // Get and validate input
        $data = Router::getRequestBody();
        if (empty($data)) {
            errorResponse('No data provided for update', 400);
        }
        
        // Remove sensitive fields
        unset($data['id'], $data['created_at'], $data['updated_at']);
        
        // Update service
        $success = Database::update('servicios', $data, 'id = ?', [$id]);
        
        if (!$success) {
            errorResponse('Failed to update service', 500);
        }
        
        successResponse('Service updated successfully');
    });
    
    $router->delete('/services/{id}', function($params) {
        $id = (int)$params['id'];
        
        if ($id <= 0) {
            errorResponse('Invalid service ID', 400);
        }
        
        // Check if service exists
        $service = Database::fetch("SELECT id FROM servicios WHERE id = ?", [$id]);
        if (!$service) {
            errorResponse('Service not found', 404);
        }
        
        // Delete service
        $success = Database::delete('servicios', 'id = ?', [$id]);
        
        if (!$success) {
            errorResponse('Failed to delete service', 500);
        }
        
        successResponse('Service deleted successfully');
    });
    
    // Category CRUD
    $router->post('/categories', function() {
        $data = Router::requireParams(['nombre_categoria', 'slug']);
        $data = Router::validateTypes([
            'nombre_categoria' => 'string',
            'slug' => 'string'
        ], $data);
        
        // Check if slug already exists
        $existing = Database::fetch("SELECT id FROM categorias WHERE slug = ?", [$data['slug']]);
        if ($existing) {
            errorResponse('Category slug already exists', 409);
        }
        
        $categoryId = Database::insert('categorias', [
            'nombre_categoria' => $data['nombre_categoria'],
            'slug' => $data['slug']
        ]);
        
        if (!$categoryId) {
            errorResponse('Failed to create category', 500);
        }
        
        successResponse('Category created successfully', ['id' => $categoryId]);
    });
    
    $router->put('/categories/{id}', function($params) {
        $id = (int)$params['id'];
        
        if ($id <= 0) {
            errorResponse('Invalid category ID', 400);
        }
        
        $data = Router::getRequestBody();
        if (empty($data)) {
            errorResponse('No data provided for update', 400);
        }
        
        unset($data['id'], $data['created_at'], $data['updated_at']);
        
        $success = Database::update('categorias', $data, 'id = ?', [$id]);
        
        if (!$success) {
            errorResponse('Failed to update category', 500);
        }
        
        successResponse('Category updated successfully');
    });
    
    $router->delete('/categories/{id}', function($params) {
        $id = (int)$params['id'];
        
        if ($id <= 0) {
            errorResponse('Invalid category ID', 400);
        }
        
        // Check if category has projects
        $projectsCount = Database::fetch("SELECT COUNT(*) as count FROM proyectos WHERE categoria_id = ?", [$id]);
        if ($projectsCount['count'] > 0) {
            errorResponse('Cannot delete category with associated projects', 400);
        }
        
        $success = Database::delete('categorias', 'id = ?', [$id]);
        
        if (!$success) {
            errorResponse('Failed to delete category', 500);
        }
        
        successResponse('Category deleted successfully');
    });
    
    // Testimonial CRUD
    $router->post('/testimonials', function() {
        $data = Router::requireParams(['nombre_cliente', 'comentario', 'estrellas']);
        $data = Router::validateTypes([
            'nombre_cliente' => 'string',
            'cargo' => 'string',
            'comentario' => 'string',
            'estrellas' => 'int',
            'avatar_path' => 'string',
            'estado' => 'string'
        ], $data);
        
        // Validate stars range
        if ($data['estrellas'] < 1 || $data['estrellas'] > 5) {
            errorResponse('Stars must be between 1 and 5', 400);
        }
        
        $testimonialData = [
            'nombre_cliente' => $data['nombre_cliente'],
            'cargo' => $data['cargo'] ?? null,
            'comentario' => $data['comentario'],
            'estrellas' => $data['estrellas'],
            'avatar_path' => $data['avatar_path'] ?? null,
            'estado' => $data['estado'] ?? 'activo'
        ];
        
        $testimonialId = Database::insert('testimonios', $testimonialData);
        
        if (!$testimonialId) {
            errorResponse('Failed to create testimonial', 500);
        }
        
        successResponse('Testimonial created successfully', ['id' => $testimonialId]);
    });
    
    $router->put('/testimonials/{id}', function($params) {
        $id = (int)$params['id'];
        
        if ($id <= 0) {
            errorResponse('Invalid testimonial ID', 400);
        }
        
        $data = Router::getRequestBody();
        if (empty($data)) {
            errorResponse('No data provided for update', 400);
        }
        
        // Validate stars if provided
        if (isset($data['estrellas']) && ($data['estrellas'] < 1 || $data['estrellas'] > 5)) {
            errorResponse('Stars must be between 1 and 5', 400);
        }
        
        unset($data['id'], $data['created_at'], $data['updated_at']);
        
        $success = Database::update('testimonios', $data, 'id = ?', [$id]);
        
        if (!$success) {
            errorResponse('Failed to update testimonial', 500);
        }
        
        successResponse('Testimonial updated successfully');
    });
    
    $router->delete('/testimonials/{id}', function($params) {
        $id = (int)$params['id'];
        
        if ($id <= 0) {
            errorResponse('Invalid testimonial ID', 400);
        }
        
        $success = Database::delete('testimonios', 'id = ?', [$id]);
        
        if (!$success) {
            errorResponse('Failed to delete testimonial', 500);
        }
        
        successResponse('Testimonial deleted successfully');
    });
    
    // CMS Configuration CRUD
    $router->post('/config', function() {
        $data = Router::requireParams(['clave', 'valor', 'tipo']);
        $data = Router::validateTypes([
            'clave' => 'string',
            'valor' => 'string',
            'tipo' => 'string',
            'descripcion' => 'string',
            'editable' => 'boolean'
        ], $data);
        
        // Check if key already exists
        $existing = Database::fetch("SELECT id FROM configuracion_cms WHERE clave = ?", [$data['clave']]);
        if ($existing) {
            errorResponse('Configuration key already exists', 409);
        }
        
        $configData = [
            'clave' => $data['clave'],
            'valor' => $data['valor'],
            'tipo' => $data['tipo'],
            'descripcion' => $data['descripcion'] ?? null,
            'editable' => $data['editable'] ?? true
        ];
        
        $configId = Database::insert('configuracion_cms', $configData);
        
        if (!$configId) {
            errorResponse('Failed to create configuration', 500);
        }
        
        successResponse('Configuration created successfully', ['id' => $configId]);
    });
    
    $router->put('/config/{id}', function($params) {
        $id = (int)$params['id'];
        
        if ($id <= 0) {
            errorResponse('Invalid configuration ID', 400);
        }
        
        $data = Router::getRequestBody();
        if (empty($data)) {
            errorResponse('No data provided for update', 400);
        }
        
        unset($data['id'], $data['created_at'], $data['updated_at']);
        
        $success = Database::update('configuracion_cms', $data, 'id = ?', [$id]);
        
        if (!$success) {
            errorResponse('Failed to update configuration', 500);
        }
        
        successResponse('Configuration updated successfully');
    });
    
    $router->delete('/config/{id}', function($params) {
        $id = (int)$params['id'];
        
        if ($id <= 0) {
            errorResponse('Invalid configuration ID', 400);
        }
        
        $success = Database::delete('configuracion_cms', 'id = ?', [$id]);
        
        if (!$success) {
            errorResponse('Failed to delete configuration', 500);
        }
        
        successResponse('Configuration deleted successfully');
    });
});

// ===================================================================
// Error Handling
// ===================================================================

// 404 handler (catch-all)
$router->any('/{path}', function() {
    errorResponse('Endpoint not found', 404);
});

// ===================================================================
// Dispatch Request
// ===================================================================

try {
    $router->dispatch();
} catch (Exception $e) {
    // Log error
    error_log('API Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine());
    
    // Return error response
    if (APP_DEBUG) {
        errorResponse(
            $e->getMessage(),
            500,
            [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]
        );
    } else {
        errorResponse('Internal Server Error', 500);
    }
}
