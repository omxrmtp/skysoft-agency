<?php

declare(strict_types=1);

namespace SkySoft\Controllers;

use SkySoft\Core\Database;
use SkySoft\Middleware\AuthMiddleware;

/**
 * CRM Controller
 * 
 * Handles CRM dashboard and management operations
 */
class CrmController
{
    /**
     * Get dashboard statistics
     */
    public static function getDashboard(): void
    {
        AuthMiddleware::requireAuth();

        // Get general statistics
        $statsQuery = "
            SELECT 
                COUNT(*) as total_leads,
                COUNT(CASE WHEN estado_gestion = 'nuevo' THEN 1 END) as nuevos_leads,
                COUNT(CASE WHEN estado_gestion = 'contactado' THEN 1 END) as contactados_leads,
                COUNT(CASE WHEN estado_gestion = 'cerrado' THEN 1 END) as cerrados_leads,
                COUNT(CASE WHEN fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as leads_this_week,
                COUNT(CASE WHEN fecha_registro >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as leads_this_month
            FROM leads
        ";
        $leadStats = Database::fetch($statsQuery);

        // Get project statistics
        $projectStatsQuery = "
            SELECT 
                COUNT(*) as total_proyectos,
                COUNT(CASE WHEN destacado = 1 THEN 1 END) as proyectos_destacados,
                COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as proyectos_this_month
            FROM proyectos
        ";
        $projectStats = Database::fetch($projectStatsQuery);

        // Get service statistics
        $serviceStats = Database::fetch("
            SELECT 
                COUNT(*) as total_servicios,
                COUNT(CASE WHEN estado = 'activo' THEN 1 END) as servicios_activos
            FROM servicios
        ");

        // Get testimonio statistics
        $testimonialStats = Database::fetch("
            SELECT 
                COUNT(*) as total_testimonios,
                COUNT(CASE WHEN estado = 'activo' THEN 1 END) as testimonios_activos,
                AVG(estrellas) as avg_estrellas
            FROM testimonios
        ");

        // Get latest project
        $latestProjectQuery = "
            SELECT 
                p.id,
                p.titulo,
                p.cliente,
                p.fecha_fin,
                c.nombre_categoria
            FROM proyectos p
            INNER JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.created_at DESC
            LIMIT 1
        ";
        $latestProject = Database::fetch($latestProjectQuery);

        // Get recent leads (last 5)
        $recentLeadsQuery = "
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
            LIMIT 5
        ";
        $recentLeads = Database::fetchAll($recentLeadsQuery);

        // Get leads by status for chart
        $leadsByStatusQuery = "
            SELECT 
                estado_gestion,
                COUNT(*) as count
            FROM leads
            GROUP BY estado_gestion
        ";
        $leadsByStatus = Database::fetchAll($leadsByStatusQuery);

        // Get leads by month for chart (last 6 months)
        $leadsByMonthQuery = "
            SELECT 
                DATE_FORMAT(fecha_registro, '%Y-%m') as month,
                COUNT(*) as count
            FROM leads
            WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha_registro, '%Y-%m')
            ORDER BY month ASC
        ";
        $leadsByMonth = Database::fetchAll($leadsByMonthQuery);

        // Get projects by category for chart
        $projectsByCategoryQuery = "
            SELECT 
                c.nombre_categoria,
                COUNT(p.id) as count
            FROM categorias c
            LEFT JOIN proyectos p ON c.id = p.categoria_id
            GROUP BY c.id, c.nombre_categoria
            ORDER BY count DESC
        ";
        $projectsByCategory = Database::fetchAll($projectsByCategoryQuery);

        // Get top services requested
        $topServicesQuery = "
            SELECT 
                s.titulo,
                COUNT(l.id) as lead_count
            FROM servicios s
            LEFT JOIN leads l ON s.id = l.servicio_id
            WHERE s.estado = 'activo'
            GROUP BY s.id, s.titulo
            HAVING lead_count > 0
            ORDER BY lead_count DESC
            LIMIT 5
        ";
        $topServices = Database::fetchAll($topServicesQuery);

        successResponse('Dashboard data retrieved successfully', [
            'stats' => [
                'leads' => $leadStats,
                'projects' => $projectStats,
                'services' => $serviceStats,
                'testimonials' => $testimonialStats
            ],
            'latest_project' => $latestProject,
            'recent_leads' => $recentLeads,
            'charts' => [
                'leads_by_status' => $leadsByStatus,
                'leads_by_month' => $leadsByMonth,
                'projects_by_category' => $projectsByCategory,
                'top_services' => $topServices
            ]
        ]);
    }

    /**
     * Get CRM activity feed
     */
    public static function getActivityFeed(): void
    {
        AuthMiddleware::requireAuth();

        $limit = (int)($_GET['limit'] ?? 20);
        $type = $_GET['type'] ?? null;

        // Build query based on type filter
        $whereClause = '';
        $queryParams = [];

        if ($type) {
            switch ($type) {
                case 'leads':
                    $whereClause = "WHERE activity_type = 'lead_created' OR activity_type = 'lead_status_updated'";
                    break;
                case 'projects':
                    $whereClause = "WHERE activity_type = 'project_created' OR activity_type = 'project_updated'";
                    break;
                case 'users':
                    $whereClause = "WHERE activity_type LIKE '%user%'";
                    break;
            }
        }

        // For now, we'll create a simple activity feed from recent data
        // In a real implementation, you'd have a dedicated activities table
        $activities = [];

        // Get recent leads
        $recentLeads = Database::fetchAll("
            SELECT 
                id,
                nombre,
                correo,
                fecha_registro,
                'lead_created' as activity_type,
                'New lead received' as description
            FROM leads
            WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY fecha_registro DESC
            LIMIT 10
        ");

        foreach ($recentLeads as $lead) {
            $activities[] = [
                'id' => 'lead_' . $lead['id'],
                'type' => $lead['activity_type'],
                'description' => $lead['description'],
                'details' => [
                    'lead_id' => $lead['id'],
                    'name' => $lead['nombre'],
                    'email' => $lead['correo']
                ],
                'timestamp' => $lead['fecha_registro']
            ];
        }

        // Get recent projects
        $recentProjects = Database::fetchAll("
            SELECT 
                id,
                titulo,
                cliente,
                created_at,
                'project_created' as activity_type,
                'New project added' as description
            FROM proyectos
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC
            LIMIT 10
        ");

        foreach ($recentProjects as $project) {
            $activities[] = [
                'id' => 'project_' . $project['id'],
                'type' => $project['activity_type'],
                'description' => $project['description'],
                'details' => [
                    'project_id' => $project['id'],
                    'title' => $project['titulo'],
                    'client' => $project['cliente']
                ],
                'timestamp' => $project['created_at']
            ];
        }

        // Sort all activities by timestamp
        usort($activities, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        // Limit results
        $activities = array_slice($activities, 0, $limit);

        successResponse('Activity feed retrieved successfully', $activities);
    }

    /**
     * Get performance metrics
     */
    public static function getPerformanceMetrics(): void
    {
        AuthMiddleware::requireAuth();

        $period = $_GET['period'] ?? '30'; // days

        // Lead conversion rate
        $conversionQuery = "
            SELECT 
                COUNT(*) as total_leads,
                COUNT(CASE WHEN estado_gestion = 'cerrado' THEN 1 END) as converted_leads
            FROM leads
            WHERE fecha_registro >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ";
        $conversionData = Database::fetch($conversionQuery, [$period]);
        $conversionRate = $conversionData['total_leads'] > 0 
            ? round(($conversionData['converted_leads'] / $conversionData['total_leads']) * 100, 2)
            : 0;

        // Average response time (simplified - would need timestamp for status changes)
        $responseTimeQuery = "
            SELECT 
                AVG(DATEDIFF(ultima_actualizacion, fecha_registro)) as avg_days_to_contact
            FROM leads
            WHERE estado_gestion = 'contactado' 
            AND fecha_registro >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ";
        $responseTimeData = Database::fetch($responseTimeQuery, [$period]);

        // Lead sources (if you track this)
        $leadSourcesQuery = "
            SELECT 
                s.titulo as source,
                COUNT(l.id) as count
            FROM servicios s
            LEFT JOIN leads l ON s.id = l.servicio_id
            WHERE l.fecha_registro >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY s.id, s.titulo
            ORDER BY count DESC
        ";
        $leadSources = Database::fetchAll($leadSourcesQuery, [$period]);

        // Project completion rate
        $projectCompletionQuery = "
            SELECT 
                COUNT(*) as total_projects,
                COUNT(CASE WHEN fecha_fin IS NOT NULL AND fecha_fin <= NOW() THEN 1 END) as completed_projects
            FROM proyectos
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        ";
        $projectCompletionData = Database::fetch($projectCompletionQuery, [$period]);
        $completionRate = $projectCompletionData['total_projects'] > 0
            ? round(($projectCompletionData['completed_projects'] / $projectCompletionData['total_projects']) * 100, 2)
            : 0;

        successResponse('Performance metrics retrieved successfully', [
            'conversion_rate' => [
                'value' => $conversionRate,
                'total_leads' => (int)$conversionData['total_leads'],
                'converted_leads' => (int)$conversionData['converted_leads']
            ],
            'response_time' => [
                'avg_days_to_contact' => round((float)$responseTimeData['avg_days_to_contact'], 1)
            ],
            'lead_sources' => $leadSources,
            'project_completion_rate' => [
                'value' => $completionRate,
                'total_projects' => (int)$projectCompletionData['total_projects'],
                'completed_projects' => (int)$projectCompletionData['completed_projects']
            ],
            'period_days' => (int)$period
        ]);
    }

    /**
     * Get quick actions data
     */
    public static function getQuickActions(): void
    {
        AuthMiddleware::requireAuth();

        // Unread leads count
        $unreadLeadsCount = Database::fetch("
            SELECT COUNT(*) as count
            FROM leads
            WHERE estado_gestion = 'nuevo'
        ");

        // Pending tasks (simplified - you'd have a tasks table in real implementation)
        $pendingTasksCount = Database::fetch("
            SELECT COUNT(*) as count
            FROM leads
            WHERE estado_gestion = 'nuevo' 
            AND fecha_registro >= DATE_SUB(NOW(), INTERVAL 2 DAY)
        ");

        // Recent activities needing attention
        $attentionNeeded = Database::fetchAll("
            SELECT 
                'lead' as type,
                id,
                nombre as title,
                correo as subtitle,
                fecha_registro as timestamp,
                estado_gestion as status
            FROM leads
            WHERE estado_gestion = 'nuevo'
            ORDER BY fecha_registro ASC
            LIMIT 5
        ");

        successResponse('Quick actions data retrieved successfully', [
            'unread_leads' => (int)$unreadLeadsCount['count'],
            'pending_tasks' => (int)$pendingTasksCount['count'],
            'attention_needed' => $attentionNeeded
        ]);
    }

    /**
     * Export dashboard data to PDF/Excel
     */
    public static function exportDashboard(): void
    {
        AuthMiddleware::requireAuth();

        $format = $_GET['format'] ?? 'pdf';
        $period = $_GET['period'] ?? '30';

        // Get dashboard data
        $dashboard = self::getDashboardData($period);

        // For now, just return JSON data
        // In a real implementation, you'd generate PDF/Excel files
        successResponse('Dashboard export data prepared', [
            'format' => $format,
            'period' => $period,
            'data' => $dashboard,
            'download_url' => '/api/v1/crm/download?format=' . $format . '&period=' . $period
        ]);
    }

    /**
     * Helper method to get dashboard data
     */
    private static function getDashboardData(int $period): array
    {
        // This would contain the same logic as getDashboard() but for export
        // Simplified for this example
        return [
            'generated_at' => date('Y-m-d H:i:s'),
            'period_days' => $period,
            'summary' => 'Dashboard data for export'
        ];
    }
}
