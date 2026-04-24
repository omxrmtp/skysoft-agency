<?php

declare(strict_types=1);

namespace SkySoft\Middleware;

/**
 * CORS Middleware
 * 
 * Handles Cross-Origin Resource Sharing headers and preflight requests
 */
class CorsMiddleware
{
    /**
     * Handle CORS headers and preflight requests
     */
    public static function handle(): void
    {
        // Get allowed origins from config
        $allowedOrigins = CORS_ALLOWED_ORIGINS;
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Check if origin is allowed
        $allowedOrigin = in_array($origin, $allowedOrigins) ? $origin : $allowedOrigins[0];
        
        // Set CORS headers
        header("Access-Control-Allow-Origin: {$allowedOrigin}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Methods: ' . implode(', ', CORS_ALLOWED_METHODS));
        header('Access-Control-Allow-Headers: ' . implode(', ', CORS_ALLOWED_HEADERS));
        header('Access-Control-Max-Age: 3600');
        header('Vary: Origin');
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
