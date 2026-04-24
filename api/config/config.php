<?php

declare(strict_types=1);

/**
 * SkySoft API Configuration
 * 
 * Central configuration file for the SkySoft API
 */

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0) continue;
        
        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            
            // Remove quotes if present
            $value = trim($value, '"\'');
            
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
}

// Database Configuration
define('DB_HOST', $_ENV['DB_HOST'] ?? 'localhost');
define('DB_PORT', $_ENV['DB_PORT'] ?? '3306');
define('DB_NAME', $_ENV['DB_NAME'] ?? 'skysoft_agency');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASSWORD', $_ENV['DB_PASSWORD'] ?? '');
define('DB_CHARSET', $_ENV['DB_CHARSET'] ?? 'utf8mb4');

// API Configuration
define('API_VERSION', 'v1');
define('API_BASE_URL', '/api/' . API_VERSION);
define('API_NAME', 'SkySoft API');
define('API_DESCRIPTION', 'SkySoft Agency RESTful API');

// Security Configuration
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'your-super-secret-jwt-key-change-in-production');
define('JWT_EXPIRE_TIME', $_ENV['JWT_EXPIRE_TIME'] ?? 86400); // 24 hours
define('BCRYPT_COST', $_ENV['BCRYPT_COST'] ?? 12);

// CORS Configuration
define('CORS_ALLOWED_ORIGINS', [
    'http://localhost:5173',  // Vite default port
    'http://localhost:3000',  // React default port
    'http://localhost:8080',  // Vue default port
    'https://yourdomain.com'  // Production domain
]);

define('CORS_ALLOWED_METHODS', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
define('CORS_ALLOWED_HEADERS', ['Content-Type', 'Authorization', 'X-Requested-With']);

// File Upload Configuration
define('UPLOAD_MAX_SIZE', $_ENV['UPLOAD_MAX_SIZE'] ?? 5 * 1024 * 1024); // 5MB
define('UPLOAD_ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']);
define('UPLOAD_PATH', $_ENV['UPLOAD_PATH'] ?? __DIR__ . '/../uploads');

// Email Configuration (for notifications)
define('SMTP_HOST', $_ENV['SMTP_HOST'] ?? '');
define('SMTP_PORT', $_ENV['SMTP_PORT'] ?? 587);
define('SMTP_USERNAME', $_ENV['SMTP_USERNAME'] ?? '');
define('SMTP_PASSWORD', $_ENV['SMTP_PASSWORD'] ?? '');
define('SMTP_FROM_EMAIL', $_ENV['SMTP_FROM_EMAIL'] ?? 'noreply@skysoft.com');
define('SMTP_FROM_NAME', $_ENV['SMTP_FROM_NAME'] ?? 'SkySoft Agency');

// Application Configuration
define('APP_ENV', $_ENV['APP_ENV'] ?? 'development');
define('APP_DEBUG', $_ENV['APP_DEBUG'] ?? true);
define('APP_TIMEZONE', $_ENV['APP_TIMEZONE'] ?? 'UTC');

// Error Reporting Configuration
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
    ini_set('display_errors', '0');
}

// Set default timezone
date_default_timezone_set(APP_TIMEZONE);

// Session Configuration
define('SESSION_NAME', 'skysoft_session');
define('SESSION_LIFETIME', 86400); // 24 hours
define('SESSION_PATH', '/');
define('SESSION_DOMAIN', $_ENV['SESSION_DOMAIN'] ?? '');
define('SESSION_SECURE', $_ENV['SESSION_SECURE'] ?? false);
define('SESSION_HTTPONLY', true);

// Rate Limiting Configuration
define('RATE_LIMIT_REQUESTS', $_ENV['RATE_LIMIT_REQUESTS'] ?? 100);
define('RATE_LIMIT_WINDOW', $_ENV['RATE_LIMIT_WINDOW'] ?? 3600); // 1 hour

// Cache Configuration (if implemented)
define('CACHE_DRIVER', $_ENV['CACHE_DRIVER'] ?? 'file');
define('CACHE_TTL', $_ENV['CACHE_TTL'] ?? 3600); // 1 hour

// Logging Configuration
define('LOG_PATH', $_ENV['LOG_PATH'] ?? __DIR__ . '/../logs');
define('LOG_LEVEL', $_ENV['LOG_LEVEL'] ?? 'INFO');

// Initialize Database
require_once __DIR__ . '/../core/Database.php';
use SkySoft\Core\Database;

// Set database configuration
Database::setConfig([
    'host' => DB_HOST,
    'port' => DB_PORT,
    'dbname' => DB_NAME,
    'charset' => DB_CHARSET,
    'username' => DB_USER,
    'password' => DB_PASSWORD,
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::ATTR_PERSISTENT => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
        PDO::ATTR_TIMEOUT => 30
    ]
]);

// Helper Functions

/**
 * Get environment variable with default value
 */
function env(string $key, mixed $default = null): mixed
{
    return $_ENV[$key] ?? $_SERVER[$key] ?? $default;
}

/**
 * Get base URL
 */
function getBaseUrl(): string
{
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    return $protocol . '://' . $host;
}

/**
 * Get API base URL
 */
function getApiBaseUrl(): string
{
    return getBaseUrl() . API_BASE_URL;
}

/**
 * Check if request is AJAX
 */
function isAjaxRequest(): bool
{
    return !empty($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Get client IP address
 */
function getClientIp(): string
{
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (!empty($_SERVER[$key])) {
            $ips = explode(',', $_SERVER[$key]);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                return $ip;
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
}

/**
 * Generate random token
 */
function generateToken(int $length = 32): string
{
    return bin2hex(random_bytes($length / 2));
}

/**
 * Hash password using bcrypt
 */
function hashPassword(string $password): string
{
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
}

/**
 * Verify password
 */
function verifyPassword(string $password, string $hash): bool
{
    return password_verify($password, $hash);
}

/**
 * Sanitize input data
 */
function sanitizeInput(mixed $input): mixed
{
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    
    if (is_string($input)) {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
    
    return $input;
}

/**
 * Validate email
 */
function isValidEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Format JSON response
 */
function jsonResponse(array $data, int $statusCode = 200): void
{
    header_remove();
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Format error response
 */
function errorResponse(string $message, int $statusCode = 400, array $errors = []): void
{
    jsonResponse([
        'success' => false,
        'message' => $message,
        'errors' => $errors,
        'timestamp' => date('Y-m-d H:i:s')
    ], $statusCode);
}

/**
 * Format success response
 */
function successResponse(string $message, mixed $data = null, int $statusCode = 200): void
{
    jsonResponse([
        'success' => true,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ], $statusCode);
}

// Auto-load classes
spl_autoload_register(function ($class) {
    $prefix = 'SkySoft\\';
    $base_dir = __DIR__ . '/../';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});
