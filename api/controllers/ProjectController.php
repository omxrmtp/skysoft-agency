<?php

declare(strict_types=1);

namespace SkySoft\Controllers;

use SkySoft\Core\Database;
use SkySoft\Middleware\SecurityMiddleware;

/**
 * Project Controller
 * 
 * Handles CRUD operations for projects
 */
class ProjectController
{
    /**
     * Get all projects with optional filtering
     */
    public static function getAll(array $params = []): void
    {
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 10);
        $category = $_GET['category'] ?? null;
        $featured = $_GET['featured'] ?? null;
        $search = $_GET['search'] ?? null;

        $offset = ($page - 1) * $limit;

        // Build query
        $whereConditions = [];
        $queryParams = [];

        if ($category) {
            $whereConditions[] = "c.slug = ?";
            $queryParams[] = $category;
        }

        if ($featured !== null) {
            $whereConditions[] = "p.destacado = ?";
            $queryParams[] = $featured === 'true' ? 1 : 0;
        }

        if ($search) {
            $whereConditions[] = "(p.titulo LIKE ? OR p.descripcion LIKE ? OR p.cliente LIKE ?)";
            $searchParam = "%{$search}%";
            $queryParams[] = $searchParam;
            $queryParams[] = $searchParam;
            $queryParams[] = $searchParam;
        }

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

        // Get total count
        $countQuery = "
            SELECT COUNT(*) as total
            FROM proyectos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            {$whereClause}
        ";
        $totalResult = Database::fetch($countQuery, $queryParams);
        $total = (int)($totalResult['total'] ?? 0);

        // Get projects
        $query = "
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
            {$whereClause}
            ORDER BY p.fecha_fin DESC, p.created_at DESC
            LIMIT ? OFFSET ?
        ";

        $queryParams[] = $limit;
        $queryParams[] = $offset;

        $projects = Database::fetchAll($query, $queryParams);

        successResponse('Projects retrieved successfully', [
            'projects' => $projects,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ]
        ]);
    }

    /**
     * Get single project by ID
     */
    public static function getById(array $params): void
    {
        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            errorResponse('Invalid project ID', 400);
        }

        $query = "
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
                p.updated_at,
                c.nombre_categoria,
                c.slug as categoria_slug
            FROM proyectos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ?
        ";

        $project = Database::fetch($query, [$id]);

        if (!$project) {
            errorResponse('Project not found', 404);
        }

        successResponse('Project retrieved successfully', $project);
    }

    /**
     * Create new project
     */
    public static function create(): void
    {
        // Get and validate input
        $data = Router::requireParams(['titulo', 'descripcion', 'cliente', 'categoria_id']);
        $data = Router::validateTypes([
            'titulo' => 'string',
            'descripcion' => 'string',
            'cliente' => 'string',
            'categoria_id' => 'int',
            'url' => 'url',
            'destacado' => 'int'
        ], $data);

        // Verify category exists
        $category = Database::fetch("SELECT id FROM categorias WHERE id = ?", [$data['categoria_id']]);
        if (!$category) {
            errorResponse('Category not found', 400);
        }

        // Handle file upload if present
        $imagePath = null;
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            if (!SecurityMiddleware::validateFileUpload($_FILES['imagen'])) {
                errorResponse('Invalid file upload', 400);
            }

            $imagePath = self::handleImageUpload($_FILES['imagen']);
        }

        // Prepare project data
        $projectData = [
            'categoria_id' => $data['categoria_id'],
            'titulo' => $data['titulo'],
            'descripcion' => $data['descripcion'],
            'cliente' => $data['cliente'],
            'url' => $data['url'] ?? null,
            'imagen_path' => $imagePath,
            'fecha_fin' => $data['fecha_fin'] ?? null,
            'destacado' => ($data['destacado'] ?? 0) ? 1 : 0
        ];

        // Insert project
        $projectId = Database::insert('proyectos', $projectData);

        if (!$projectId) {
            errorResponse('Failed to create project', 500);
        }

        // Get created project
        self::getById(['id' => $projectId]);
    }

    /**
     * Update existing project
     */
    public static function update(array $params): void
    {
        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            errorResponse('Invalid project ID', 400);
        }

        // Check if project exists
        $existingProject = Database::fetch("SELECT id FROM proyectos WHERE id = ?", [$id]);
        if (!$existingProject) {
            errorResponse('Project not found', 404);
        }

        // Get and validate input
        $data = Router::getRequestBody();
        if (empty($data)) {
            errorResponse('No data provided for update', 400);
        }

        $data = Router::validateTypes([
            'titulo' => 'string',
            'descripcion' => 'string',
            'cliente' => 'string',
            'categoria_id' => 'int',
            'url' => 'url',
            'destacado' => 'int'
        ], $data);

        // Verify category exists if provided
        if (isset($data['categoria_id'])) {
            $category = Database::fetch("SELECT id FROM categorias WHERE id = ?", [$data['categoria_id']]);
            if (!$category) {
                errorResponse('Category not found', 400);
            }
        }

        // Handle file upload if present
        if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            if (!SecurityMiddleware::validateFileUpload($_FILES['imagen'])) {
                errorResponse('Invalid file upload', 400);
            }

            $imagePath = self::handleImageUpload($_FILES['imagen']);
            $data['imagen_path'] = $imagePath;
        }

        // Remove sensitive fields from update data
        unset($data['id'], $data['created_at'], $data['updated_at']);

        // Update project
        $success = Database::update('proyectos', $data, 'id = ?', [$id]);

        if (!$success) {
            errorResponse('Failed to update project', 500);
        }

        // Get updated project
        self::getById(['id' => $id]);
    }

    /**
     * Delete project
     */
    public static function delete(array $params): void
    {
        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            errorResponse('Invalid project ID', 400);
        }

        // Get project for cleanup
        $project = Database::fetch("SELECT imagen_path FROM proyectos WHERE id = ?", [$id]);
        
        if (!$project) {
            errorResponse('Project not found', 404);
        }

        // Delete project
        $success = Database::delete('proyectos', 'id = ?', [$id]);

        if (!$success) {
            errorResponse('Failed to delete project', 500);
        }

        // Delete image file if exists
        if ($project['imagen_path'] && file_exists(UPLOAD_PATH . '/' . $project['imagen_path'])) {
            unlink(UPLOAD_PATH . '/' . $project['imagen_path']);
        }

        successResponse('Project deleted successfully');
    }

    /**
     * Get featured projects
     */
    public static function getFeatured(): void
    {
        $limit = (int)($_GET['limit'] ?? 6);

        $query = "
            SELECT 
                p.id,
                p.titulo,
                p.descripcion,
                p.cliente,
                p.url,
                p.imagen_path,
                p.fecha_fin,
                c.nombre_categoria,
                c.slug as categoria_slug
            FROM proyectos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            WHERE p.destacado = 1
            ORDER BY p.fecha_fin DESC, p.created_at DESC
            LIMIT ?
        ";

        $projects = Database::fetchAll($query, [$limit]);

        successResponse('Featured projects retrieved successfully', $projects);
    }

    /**
     * Get projects by category
     */
    public static function getByCategory(array $params): void
    {
        $slug = $params['slug'] ?? '';
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 10);
        $offset = ($page - 1) * $limit;

        if (empty($slug)) {
            errorResponse('Category slug is required', 400);
        }

        // Get category
        $category = Database::fetch("SELECT id, nombre_categoria FROM categorias WHERE slug = ?", [$slug]);
        if (!$category) {
            errorResponse('Category not found', 404);
        }

        // Get total count
        $totalQuery = "
            SELECT COUNT(*) as total
            FROM proyectos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            WHERE c.slug = ?
        ";
        $totalResult = Database::fetch($totalQuery, [$slug]);
        $total = (int)($totalResult['total'] ?? 0);

        // Get projects
        $query = "
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
            WHERE c.slug = ?
            ORDER BY p.fecha_fin DESC, p.created_at DESC
            LIMIT ? OFFSET ?
        ";

        $projects = Database::fetchAll($query, [$slug, $limit, $offset]);

        successResponse('Projects by category retrieved successfully', [
            'category' => $category,
            'projects' => $projects,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit),
                'has_next' => $page < ceil($total / $limit),
                'has_prev' => $page > 1
            ]
        ]);
    }

    /**
     * Handle image upload
     */
    private static function handleImageUpload(array $file): string
    {
        // Create upload directory if it doesn't exist
        if (!is_dir(UPLOAD_PATH)) {
            mkdir(UPLOAD_PATH, 0755, true);
        }

        // Generate unique filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = 'project_' . uniqid() . '.' . $extension;
        $filepath = UPLOAD_PATH . '/' . $filename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filepath)) {
            errorResponse('Failed to upload image', 500);
        }

        return $filename;
    }

    /**
     * Get project statistics
     */
    public static function getStats(): void
    {
        $query = "
            SELECT 
                COUNT(*) as total_projects,
                COUNT(CASE WHEN destacado = 1 THEN 1 END) as featured_projects,
                COUNT(CASE WHEN fecha_fin >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as recent_projects,
                COUNT(DISTINCT categoria_id) as categories_used
            FROM proyectos
        ";

        $stats = Database::fetch($query);

        successResponse('Project statistics retrieved successfully', $stats);
    }
}
