<?php

declare(strict_types=1);

namespace SkySoft\Middleware;

use SkySoft\Core\Database;

/**
 * Authentication Middleware
 * 
 * Handles JWT-based authentication for protected routes
 */
class AuthMiddleware
{
    /**
     * Authenticate user using JWT token
     * 
     * @return array|null User data if authenticated, null otherwise
     */
    public static function authenticate(): ?array
    {
        // Get Authorization header
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
            return null;
        }
        
        // Extract token
        $token = substr($authHeader, 7);
        
        try {
            // Decode JWT token (simplified version - in production use firebase/php-jwt)
            $payload = self::decodeJWT($token);
            
            if (!$payload || !isset($payload['user_id'])) {
                return null;
            }
            
            // Verify user exists and is active
            $user = Database::fetch(
                "SELECT id, nombre, email, rol, activo FROM usuarios_admin WHERE id = ? AND activo = 1",
                [$payload['user_id']]
            );
            
            if (!$user) {
                return null;
            }
            
            return $user;
            
        } catch (Exception $e) {
            error_log("Authentication error: " . $e->getMessage());
            return null;
        }
    }
    
    /**
     * Require authentication
     * 
     * @return array User data
     * @throws Exception If not authenticated
     */
    public static function requireAuth(): array
    {
        $user = self::authenticate();
        
        if (!$user) {
            errorResponse('Unauthorized - Invalid or missing token', 401);
        }
        
        return $user;
    }
    
    /**
     * Require specific role
     * 
     * @param array $roles Allowed roles
     * @return array User data
     * @throws Exception If not authorized
     */
    public static function requireRole(array $roles): array
    {
        $user = self::requireAuth();
        
        if (!in_array($user['rol'], $roles)) {
            errorResponse('Forbidden - Insufficient permissions', 403);
        }
        
        return $user;
    }
    
    /**
     * Generate JWT token
     * 
     * @param array $user User data
     * @return string JWT token
     */
    public static function generateToken(array $user): string
    {
        $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'rol' => $user['rol'],
            'iat' => time(),
            'exp' => time() + JWT_EXPIRE_TIME
        ]));
        
        $signature = hash_hmac('sha256', "{$header}.{$payload}", JWT_SECRET, true);
        $signature = base64_encode($signature);
        
        return "{$header}.{$payload}.{$signature}";
    }
    
    /**
     * Decode JWT token (simplified version)
     * 
     * @param string $token JWT token
     * @return array|null Payload data
     */
    private static function decodeJWT(string $token): ?array
    {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return null;
        }
        
        list($header, $payload, $signature) = $parts;
        
        // Verify signature
        $expectedSignature = hash_hmac('sha256', "{$header}.{$payload}", JWT_SECRET, true);
        $expectedSignature = base64_encode($expectedSignature);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return null;
        }
        
        // Decode payload
        $payloadData = json_decode(base64_decode($payload), true);
        
        if (!$payloadData || !isset($payloadData['exp'])) {
            return null;
        }
        
        // Check expiration
        if ($payloadData['exp'] < time()) {
            return null;
        }
        
        return $payloadData;
    }
    
    /**
     * Session-based authentication alternative
     * 
     * @return array|null User data if authenticated
     */
    public static function authenticateSession(): ?array
    {
        // Start session if not started
        if (session_status() === PHP_SESSION_NONE) {
            session_name(SESSION_NAME);
            session_set_cookie_params([
                'lifetime' => SESSION_LIFETIME,
                'path' => SESSION_PATH,
                'domain' => SESSION_DOMAIN,
                'secure' => SESSION_SECURE,
                'httponly' => SESSION_HTTPONLY,
                'samesite' => 'Strict'
            ]);
            session_start();
        }
        
        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        
        // Verify user exists and is active
        $user = Database::fetch(
            "SELECT id, nombre, email, rol, activo FROM usuarios_admin WHERE id = ? AND activo = 1",
            [$_SESSION['user_id']]
        );
        
        if (!$user) {
            // Clear invalid session
            session_destroy();
            return null;
        }
        
        return $user;
    }
    
    /**
     * Login user with session
     * 
     * @param array $user User data
     * @return bool Success status
     */
    public static function loginSession(array $user): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_name(SESSION_NAME);
            session_set_cookie_params([
                'lifetime' => SESSION_LIFETIME,
                'path' => SESSION_PATH,
                'domain' => SESSION_DOMAIN,
                'secure' => SESSION_SECURE,
                'httponly' => SESSION_HTTPONLY,
                'samesite' => 'Strict'
            ]);
            session_start();
        }
        
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['rol'] = $user['rol'];
        $_SESSION['login_time'] = time();
        
        // Update last login in database
        Database::update(
            'usuarios_admin',
            ['ultimo_login' => date('Y-m-d H:i:s')],
            'id = ?',
            [$user['id']]
        );
        
        return true;
    }
    
    /**
     * Logout user (session)
     * 
     * @return bool Success status
     */
    public static function logoutSession(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        session_destroy();
        return true;
    }
}
