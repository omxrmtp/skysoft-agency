<?php

declare(strict_types=1);

namespace SkySoft\Middleware;

/**
 * Security Middleware
 * 
 * Handles security measures including input sanitization, rate limiting, and XSS protection
 */
class SecurityMiddleware
{
    /**
     * Apply security measures
     */
    public static function handle(): void
    {
        self::setSecurityHeaders();
        self::sanitizeInputs();
        self::checkRateLimit();
        self::validateRequest();
    }
    
    /**
     * Set security headers
     */
    private static function setSecurityHeaders(): void
    {
        // XSS Protection
        header('X-XSS-Protection: 1; mode=block');
        
        // Content Security Policy (basic)
        header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'");
        
        // Frame protection
        header('X-Frame-Options: DENY');
        
        // MIME type sniffing protection
        header('X-Content-Type-Options: nosniff');
        
        // Referrer policy
        header('Referrer-Policy: strict-origin-when-cross-origin');
        
        // HSTS (HTTPS only)
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
        }
    }
    
    /**
     * Sanitize all input data
     */
    private static function sanitizeInputs(): void
    {
        // Sanitize GET data
        if (!empty($_GET)) {
            $_GET = self::sanitizeArray($_GET);
        }
        
        // Sanitize POST data
        if (!empty($_POST)) {
            $_POST = self::sanitizeArray($_POST);
        }
        
        // Sanitize REQUEST data
        if (!empty($_REQUEST)) {
            $_REQUEST = self::sanitizeArray($_REQUEST);
        }
        
        // Sanitize files
        if (!empty($_FILES)) {
            $_FILES = self::sanitizeFiles($_FILES);
        }
    }
    
    /**
     * Sanitize array recursively
     * 
     * @param array $data Data to sanitize
     * @return array Sanitized data
     */
    private static function sanitizeArray(array $data): array
    {
        $sanitized = [];
        
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $sanitized[$key] = self::sanitizeArray($value);
            } elseif (is_string($value)) {
                $sanitized[$key] = self::sanitizeString($value);
            } else {
                $sanitized[$key] = $value;
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize string
     * 
     * @param string $string String to sanitize
     * @return string Sanitized string
     */
    private static function sanitizeString(string $string): string
    {
        // Remove HTML tags and encode special characters
        $string = strip_tags($string);
        $string = htmlspecialchars($string, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        
        // Remove potential JavaScript event handlers
        $string = preg_replace('/on\w+\s*=\s*["\']?[^"\']*["\']?/i', '', $string);
        
        // Remove javascript: protocol
        $string = preg_replace('/javascript\s*:/i', '', $string);
        
        // Trim whitespace
        $string = trim($string);
        
        return $string;
    }
    
    /**
     * Sanitize file uploads
     * 
     * @param array $files Files array
     * @return array Sanitized files
     */
    private static function sanitizeFiles(array $files): array
    {
        $sanitized = [];
        
        foreach ($files as $key => $file) {
            if (is_array($file)) {
                if (isset($file['name'])) {
                    // Sanitize filename
                    $file['name'] = self::sanitizeFilename($file['name']);
                    $sanitized[$key] = $file;
                } else {
                    // Handle multiple files
                    $sanitized[$key] = self::sanitizeFiles($file);
                }
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize filename
     * 
     * @param string $filename Filename to sanitize
     * @return string Sanitized filename
     */
    private static function sanitizeFilename(string $filename): string
    {
        // Remove path information
        $filename = basename($filename);
        
        // Remove dangerous characters
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
        
        // Limit length
        $filename = substr($filename, 0, 255);
        
        return $filename;
    }
    
    /**
     * Check rate limiting
     */
    private static function checkRateLimit(): void
    {
        $clientIp = getClientIp();
        $currentTime = time();
        $window = RATE_LIMIT_WINDOW;
        $maxRequests = RATE_LIMIT_REQUESTS;
        
        // Simple file-based rate limiting (in production use Redis or database)
        $rateLimitFile = sys_get_temp_dir() . '/skysoft_rate_limit_' . md5($clientIp);
        
        if (file_exists($rateLimitFile)) {
            $data = json_decode(file_get_contents($rateLimitFile), true);
            
            // Reset window if expired
            if ($currentTime - $data['window_start'] > $window) {
                $data = [
                    'window_start' => $currentTime,
                    'requests' => 0
                ];
            }
            
            // Check limit
            if ($data['requests'] >= $maxRequests) {
                errorResponse('Rate limit exceeded. Please try again later.', 429);
            }
            
            $data['requests']++;
        } else {
            $data = [
                'window_start' => $currentTime,
                'requests' => 1
            ];
        }
        
        // Save rate limit data
        file_put_contents($rateLimitFile, json_encode($data));
        
        // Clean up old rate limit files (optional)
        self::cleanupRateLimitFiles();
    }
    
    /**
     * Clean up old rate limit files
     */
    private static function cleanupRateLimitFiles(): void
    {
        $tempDir = sys_get_temp_dir();
        $files = glob($tempDir . '/skysoft_rate_limit_*');
        
        foreach ($files as $file) {
            if (filemtime($file) < time() - RATE_LIMIT_WINDOW) {
                unlink($file);
            }
        }
    }
    
    /**
     * Validate request
     */
    private static function validateRequest(): void
    {
        // Check content length
        $contentLength = $_SERVER['CONTENT_LENGTH'] ?? 0;
        $maxContentLength = 10 * 1024 * 1024; // 10MB
        
        if ($contentLength > $maxContentLength) {
            errorResponse('Request too large', 413);
        }
        
        // Validate Content-Type for POST/PUT requests
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        
        if (in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            // Allow common content types
            $allowedTypes = [
                'application/json',
                'application/x-www-form-urlencoded',
                'multipart/form-data',
                'text/plain'
            ];
            
            $isValidContentType = false;
            foreach ($allowedTypes as $type) {
                if (str_starts_with($contentType, $type)) {
                    $isValidContentType = true;
                    break;
                }
            }
            
            if (!$isValidContentType && !empty($contentType)) {
                errorResponse('Invalid Content-Type', 415);
            }
        }
        
        // Validate JSON body if present
        if ($method !== 'GET' && str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            $jsonInput = file_get_contents('php://input');
            
            if (!empty($jsonInput)) {
                $decoded = json_decode($jsonInput, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    errorResponse('Invalid JSON: ' . json_last_error_msg(), 400);
                }
                
                // Store decoded JSON for later use
                $_SERVER['JSON_DECODED'] = $decoded;
            }
        }
    }
    
    /**
     * Validate CSRF token (for session-based authentication)
     * 
     * @return bool Valid CSRF token
     */
    public static function validateCsrfToken(): bool
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
        $sessionToken = $_SESSION['csrf_token'] ?? '';
        
        if (empty($token) || empty($sessionToken)) {
            return false;
        }
        
        return hash_equals($sessionToken, $token);
    }
    
    /**
     * Generate CSRF token
     * 
     * @return string CSRF token
     */
    public static function generateCsrfToken(): string
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        
        return $_SESSION['csrf_token'];
    }
    
    /**
     * Validate file upload
     * 
     * @param array $file File data
     * @return bool Valid file
     */
    public static function validateFileUpload(array $file): bool
    {
        // Check if file was uploaded
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return false;
        }
        
        // Check file size
        if ($file['size'] > UPLOAD_MAX_SIZE) {
            return false;
        }
        
        // Check file type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, UPLOAD_ALLOWED_TYPES)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Log security event
     * 
     * @param string $event Event description
     * @param array $context Event context
     */
    public static function logSecurityEvent(string $event, array $context = []): void
    {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => getClientIp(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'event' => $event,
            'context' => $context
        ];
        
        error_log('Security Event: ' . json_encode($logEntry));
        
        // In production, send to security monitoring service
    }
}
