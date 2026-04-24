<?php

declare(strict_types=1);

namespace SkySoft\Controllers;

use SkySoft\Core\Database;
use SkySoft\Middleware\SecurityMiddleware;

/**
 * Lead Controller
 * 
 * Handles lead management and CRM operations
 */
class LeadController
{
    /**
     * Get all leads with filtering and pagination
     */
    public static function getAll(): void
    {
        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $status = $_GET['status'] ?? null;
        $service = $_GET['service'] ?? null;
        $search = $_GET['search'] ?? null;
        $dateFrom = $_GET['date_from'] ?? null;
        $dateTo = $_GET['date_to'] ?? null;

        $offset = ($page - 1) * $limit;

        // Build query
        $whereConditions = [];
        $queryParams = [];

        if ($status) {
            $whereConditions[] = "l.estado_gestion = ?";
            $queryParams[] = $status;
        }

        if ($service) {
            $whereConditions[] = "s.id = ?";
            $queryParams[] = $service;
        }

        if ($search) {
            $whereConditions[] = "(l.nombre LIKE ? OR l.correo LIKE ? OR l.telefono LIKE ?)";
            $searchParam = "%{$search}%";
            $queryParams[] = $searchParam;
            $queryParams[] = $searchParam;
            $queryParams[] = $searchParam;
        }

        if ($dateFrom) {
            $whereConditions[] = "DATE(l.fecha_registro) >= ?";
            $queryParams[] = $dateFrom;
        }

        if ($dateTo) {
            $whereConditions[] = "DATE(l.fecha_registro) <= ?";
            $queryParams[] = $dateTo;
        }

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

        // Get total count
        $countQuery = "
            SELECT COUNT(*) as total
            FROM leads l
            LEFT JOIN servicios s ON l.servicio_id = s.id
            {$whereClause}
        ";
        $totalResult = Database::fetch($countQuery, $queryParams);
        $total = (int)($totalResult['total'] ?? 0);

        // Get leads
        $query = "
            SELECT 
                l.id,
                l.nombre,
                l.correo,
                l.telefono,
                l.mensaje,
                l.estado_gestion,
                l.fecha_registro,
                l.ultima_actualizacion,
                s.titulo as servicio_nombre,
                s.id as servicio_id
            FROM leads l
            LEFT JOIN servicios s ON l.servicio_id = s.id
            {$whereClause}
            ORDER BY l.fecha_registro DESC
            LIMIT ? OFFSET ?
        ";

        $queryParams[] = $limit;
        $queryParams[] = $offset;

        $leads = Database::fetchAll($query, $queryParams);

        successResponse('Leads retrieved successfully', [
            'leads' => $leads,
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
     * Get single lead by ID
     */
    public static function getById(array $params): void
    {
        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            errorResponse('Invalid lead ID', 400);
        }

        $query = "
            SELECT 
                l.id,
                l.nombre,
                l.correo,
                l.telefono,
                l.mensaje,
                l.estado_gestion,
                l.fecha_registro,
                l.ultima_actualizacion,
                s.titulo as servicio_nombre,
                s.id as servicio_id,
                s.descripcion_corta as servicio_descripcion
            FROM leads l
            LEFT JOIN servicios s ON l.servicio_id = s.id
            WHERE l.id = ?
        ";

        $lead = Database::fetch($query, [$id]);

        if (!$lead) {
            errorResponse('Lead not found', 404);
        }

        successResponse('Lead retrieved successfully', $lead);
    }

    /**
     * Create new lead (contact form submission)
     */
    public static function create(): void
    {
        // Get and validate input
        $data = Router::requireParams(['nombre', 'correo', 'mensaje']);
        $data = Router::validateTypes([
            'nombre' => 'string',
            'correo' => 'email',
            'telefono' => 'string',
            'mensaje' => 'string',
            'servicio_id' => 'int'
        ], $data);

        // Verify service exists if provided
        if (isset($data['servicio_id'])) {
            $service = Database::fetch("SELECT id FROM servicios WHERE id = ? AND estado = 'activo'", [$data['servicio_id']]);
            if (!$service) {
                errorResponse('Service not found or inactive', 400);
            }
        }

        // Check for duplicate email (optional - uncomment if needed)
        /*
        $existingLead = Database::fetch(
            "SELECT id FROM leads WHERE correo = ? AND fecha_registro > DATE_SUB(NOW(), INTERVAL 24 HOUR)",
            [$data['correo']]
        );
        if ($existingLead) {
            errorResponse('You have already submitted a request in the last 24 hours', 429);
        }
        */

        // Prepare lead data
        $leadData = [
            'nombre' => $data['nombre'],
            'correo' => $data['correo'],
            'telefono' => $data['telefono'] ?? null,
            'mensaje' => $data['mensaje'],
            'servicio_id' => $data['servicio_id'] ?? null,
            'estado_gestion' => 'nuevo'
        ];

        // Insert lead
        $leadId = Database::insert('leads', $leadData);

        if (!$leadId) {
            errorResponse('Failed to create lead', 500);
        }

        // Log the lead submission
        SecurityMiddleware::logSecurityEvent('Lead submitted', [
            'lead_id' => $leadId,
            'email' => $data['correo'],
            'service_id' => $data['servicio_id'] ?? null
        ]);

        // Send notification email (optional - implement email service)
        // self::sendLeadNotification($leadId);

        // Get created lead
        self::getById(['id' => $leadId]);
    }

    /**
     * Update lead status
     */
    public static function updateStatus(array $params): void
    {
        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            errorResponse('Invalid lead ID', 400);
        }

        // Check if lead exists
        $existingLead = Database::fetch("SELECT id FROM leads WHERE id = ?", [$id]);
        if (!$existingLead) {
            errorResponse('Lead not found', 404);
        }

        // Get and validate input
        $data = Router::requireParams(['estado_gestion']);
        $data = Router::validateTypes([
            'estado_gestion' => 'string'
        ], $data);

        // Validate status
        $validStatuses = ['nuevo', 'contactado', 'cerrado'];
        if (!in_array($data['estado_gestion'], $validStatuses)) {
            errorResponse('Invalid status. Must be: ' . implode(', ', $validStatuses), 400);
        }

        // Update lead
        $success = Database::update('leads', ['estado_gestion' => $data['estado_gestion']], 'id = ?', [$id]);

        if (!$success) {
            errorResponse('Failed to update lead status', 500);
        }

        // Log the status change
        SecurityMiddleware::logSecurityEvent('Lead status updated', [
            'lead_id' => $id,
            'new_status' => $data['estado_gestion']
        ]);

        successResponse('Lead status updated successfully');
    }

    /**
     * Delete lead
     */
    public static function delete(array $params): void
    {
        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            errorResponse('Invalid lead ID', 400);
        }

        // Check if lead exists
        $lead = Database::fetch("SELECT id, nombre, correo FROM leads WHERE id = ?", [$id]);
        if (!$lead) {
            errorResponse('Lead not found', 404);
        }

        // Delete lead
        $success = Database::delete('leads', 'id = ?', [$id]);

        if (!$success) {
            errorResponse('Failed to delete lead', 500);
        }

        // Log the deletion
        SecurityMiddleware::logSecurityEvent('Lead deleted', [
            'lead_id' => $id,
            'lead_email' => $lead['correo']
        ]);

        successResponse('Lead deleted successfully');
    }

    /**
     * Get lead statistics
     */
    public static function getStats(): void
    {
        $query = "
            SELECT 
                COUNT(*) as total_leads,
                COUNT(CASE WHEN estado_gestion = 'nuevo' THEN 1 END) as nuevos_leads,
                COUNT(CASE WHEN estado_gestion = 'contactado' THEN 1 END) as contactados_leads,
                COUNT(CASE WHEN estado_gestion = 'cerrado' THEN 1 END) as cerrados_leads,
                COUNT(CASE WHEN fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as leads_this_week,
                COUNT(CASE WHEN fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as leads_this_month,
                COUNT(DISTINCT servicio_id) as services_requested
            FROM leads
        ";

        $stats = Database::fetch($query);

        // Get leads by service
        $serviceQuery = "
            SELECT 
                s.titulo as service_name,
                COUNT(l.id) as lead_count
            FROM servicios s
            LEFT JOIN leads l ON s.id = l.servicio_id
            WHERE s.estado = 'activo'
            GROUP BY s.id, s.titulo
            ORDER BY lead_count DESC
        ";
        $serviceStats = Database::fetchAll($serviceQuery);

        // Get leads by month (last 6 months)
        $monthlyQuery = "
            SELECT 
                DATE_FORMAT(fecha_registro, '%Y-%m') as month,
                COUNT(*) as lead_count
            FROM leads
            WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha_registro, '%Y-%m')
            ORDER BY month ASC
        ";
        $monthlyStats = Database::fetchAll($monthlyQuery);

        successResponse('Lead statistics retrieved successfully', [
            'overview' => $stats,
            'by_service' => $serviceStats,
            'by_month' => $monthlyStats
        ]);
    }

    /**
     * Get recent leads
     */
    public static function getRecent(): void
    {
        $limit = (int)($_GET['limit'] ?? 10);

        $query = "
            SELECT 
                l.id,
                l.nombre,
                l.correo,
                l.estado_gestion,
                l.fecha_registro,
                s.titulo as servicio_nombre
            FROM leads l
            LEFT JOIN servicios s ON l.servicio_id = s.id
            ORDER BY l.fecha_registro DESC
            LIMIT ?
        ";

        $leads = Database::fetchAll($query, [$limit]);

        successResponse('Recent leads retrieved successfully', $leads);
    }

    /**
     * Export leads to CSV
     */
    public static function export(): void
    {
        $status = $_GET['status'] ?? null;
        $dateFrom = $_GET['date_from'] ?? null;
        $dateTo = $_GET['date_to'] ?? null;

        // Build query
        $whereConditions = [];
        $queryParams = [];

        if ($status) {
            $whereConditions[] = "l.estado_gestion = ?";
            $queryParams[] = $status;
        }

        if ($dateFrom) {
            $whereConditions[] = "DATE(l.fecha_registro) >= ?";
            $queryParams[] = $dateFrom;
        }

        if ($dateTo) {
            $whereConditions[] = "DATE(l.fecha_registro) <= ?";
            $queryParams[] = $dateTo;
        }

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

        $query = "
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
            {$whereClause}
            ORDER BY l.fecha_registro DESC
        ";

        $leads = Database::fetchAll($query, $queryParams);

        // Set headers for CSV download
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="leads_export_' . date('Y-m-d') . '.csv"');

        // Create CSV
        $output = fopen('php://output', 'w');

        // Header row
        fputcsv($output, [
            'ID',
            'Nombre',
            'Correo',
            'Teléfono',
            'Mensaje',
            'Estado',
            'Servicio',
            'Fecha Registro',
            'Última Actualización'
        ]);

        // Data rows
        foreach ($leads as $lead) {
            fputcsv($output, [
                $lead['id'],
                $lead['nombre'],
                $lead['correo'],
                $lead['telefono'],
                $lead['mensaje'],
                $lead['estado_gestion'],
                $lead['servicio_nombre'] ?? 'N/A',
                $lead['fecha_registro'],
                $lead['ultima_actualizacion']
            ]);
        }

        fclose($output);
        exit;
    }

    /**
     * Send lead notification email (placeholder)
     */
    private static function sendLeadNotification(int $leadId): void
    {
        // This would integrate with your email service
        // For now, just log the action
        SecurityMiddleware::logSecurityEvent('Lead notification sent', [
            'lead_id' => $leadId
        ]);
    }
}
