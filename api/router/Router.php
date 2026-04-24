<?php

declare(strict_types=1);

namespace SkySoft\Router;

use SkySoft\Middleware\CorsMiddleware;
use SkySoft\Middleware\SecurityMiddleware;
use SkySoft\Middleware\AuthMiddleware;

/**
 * API Router
 * 
 * Simple but powerful routing system for RESTful API
 */
class Router
{
    private array $routes = [];
    private array $middleware = [];
    private string $basePath;
    private array $params = [];

    public function __construct(string $basePath = API_BASE_URL)
    {
        $this->basePath = rtrim($basePath, '/');
    }

    /**
     * Add GET route
     */
    public function get(string $path, callable $handler, array $middleware = []): self
    {
        $this->addRoute('GET', $path, $handler, $middleware);
        return $this;
    }

    /**
     * Add POST route
     */
    public function post(string $path, callable $handler, array $middleware = []): self
    {
        $this->addRoute('POST', $path, $handler, $middleware);
        return $this;
    }

    /**
     * Add PUT route
     */
    public function put(string $path, callable $handler, array $middleware = []): self
    {
        $this->addRoute('PUT', $path, $handler, $middleware);
        return $this;
    }

    /**
     * Add DELETE route
     */
    public function delete(string $path, callable $handler, array $middleware = []): self
    {
        $this->addRoute('DELETE', $path, $handler, $middleware);
        return $this;
    }

    /**
     * Add route for any HTTP method
     */
    public function any(string $path, callable $handler, array $middleware = []): self
    {
        $this->addRoute('*', $path, $handler, $middleware);
        return $this;
    }

    /**
     * Add route to routes array
     */
    private function addRoute(string $method, string $path, callable $handler, array $middleware): void
    {
        $path = $this->basePath . '/' . ltrim($path, '/');
        
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
            'middleware' => $middleware,
            'params' => $this->extractParams($path)
        ];
    }

    /**
     * Extract route parameters
     */
    private function extractParams(string $path): array
    {
        preg_match_all('/\{([^}]+)\}/', $path, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Dispatch request to appropriate handler
     */
    public function dispatch(): void
    {
        // Apply global middleware
        CorsMiddleware::handle();
        SecurityMiddleware::handle();

        $requestMethod = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $requestPath = rtrim($requestPath, '/');

        // Find matching route
        $matchedRoute = null;
        $params = [];

        foreach ($this->routes as $route) {
            if ($route['method'] !== '*' && $route['method'] !== $requestMethod) {
                continue;
            }

            $routePath = rtrim($route['path'], '/');
            
            if ($this->pathMatches($routePath, $requestPath, $params)) {
                $matchedRoute = $route;
                break;
            }
        }

        if (!$matchedRoute) {
            $this->handleNotFound();
            return;
        }

        // Store params for use in handlers
        $this->params = $params;

        // Execute route middleware
        foreach ($matchedRoute['middleware'] as $middlewareClass) {
            if (method_exists($middlewareClass, 'handle')) {
                $middlewareClass::handle();
            }
        }

        // Execute handler
        try {
            call_user_func($matchedRoute['handler'], $params);
        } catch (Exception $e) {
            $this->handleError($e);
        }
    }

    /**
     * Check if request path matches route path
     */
    private function pathMatches(string $routePath, string $requestPath, array &$params): bool
    {
        $routeParts = explode('/', ltrim($routePath, '/'));
        $requestParts = explode('/', ltrim($requestPath, '/'));

        if (count($routeParts) !== count($requestParts)) {
            return false;
        }

        $params = [];

        foreach ($routeParts as $index => $routePart) {
            if (str_starts_with($routePart, '{') && str_ends_with($routePart, '}')) {
                $paramName = substr($routePart, 1, -1);
                $params[$paramName] = $requestParts[$index];
            } elseif ($routePart !== $requestParts[$index]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get route parameter
     */
    public function getParam(string $name, mixed $default = null): mixed
    {
        return $this->params[$name] ?? $default;
    }

    /**
     * Get all route parameters
     */
    public function getParams(): array
    {
        return $this->params;
    }

    /**
     * Handle 404 Not Found
     */
    private function handleNotFound(): void
    {
        http_response_code(404);
        jsonResponse([
            'success' => false,
            'message' => 'Endpoint not found',
            'timestamp' => date('Y-m-d H:i:s')
        ], 404);
    }

    /**
     * Handle errors
     */
    private function handleError(Exception $e): void
    {
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

    /**
     * Group routes with common middleware
     */
    public function group(array $middleware, callable $callback): self
    {
        // Store current middleware
        $previousMiddleware = $this->middleware;
        
        // Add group middleware
        $this->middleware = array_merge($this->middleware, $middleware);
        
        // Execute callback to add routes
        $callback($this);
        
        // Restore previous middleware
        $this->middleware = $previousMiddleware;
        
        return $this;
    }

    /**
     * Add middleware to all routes
     */
    public function middleware(array $middleware): self
    {
        $this->middleware = array_merge($this->middleware, $middleware);
        return $this;
    }

    /**
     * Get current middleware stack
     */
    public function getMiddleware(): array
    {
        return $this->middleware;
    }

    /**
     * Clear all routes
     */
    public function clearRoutes(): self
    {
        $this->routes = [];
        return $this;
    }

    /**
     * Get all registered routes
     */
    public function getRoutes(): array
    {
        return $this->routes;
    }

    /**
     * Validate route handler
     */
    private function validateHandler(callable $handler): bool
    {
        if (is_string($handler)) {
            return class_exists($handler) || method_exists($handler, '__invoke');
        }
        
        if (is_array($handler)) {
            return count($handler) === 2 && 
                   method_exists($handler[0], $handler[1]);
        }
        
        return is_callable($handler);
    }

    /**
     * Get request body (JSON or form data)
     */
    public static function getRequestBody(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        
        if (str_contains($contentType, 'application/json')) {
            return $_SERVER['JSON_DECODED'] ?? [];
        }
        
        return $_POST;
    }

    /**
     * Get query parameters
     */
    public static function getQueryParams(): array
    {
        return $_GET;
    }

    /**
     * Get specific query parameter
     */
    public static function getQueryParam(string $name, mixed $default = null): mixed
    {
        return $_GET[$name] ?? $default;
    }

    /**
     * Validate required parameters
     */
    public static function requireParams(array $required, array $data = null): array
    {
        $data = $data ?? self::getRequestBody();
        $missing = [];
        
        foreach ($required as $param) {
            if (!isset($data[$param]) || empty($data[$param])) {
                $missing[] = $param;
            }
        }
        
        if (!empty($missing)) {
            errorResponse('Missing required parameters: ' . implode(', ', $missing), 400);
        }
        
        return $data;
    }

    /**
     * Validate parameter types
     */
    public static function validateTypes(array $rules, array $data = null): array
    {
        $data = $data ?? self::getRequestBody();
        $errors = [];
        
        foreach ($rules as $field => $type) {
            if (isset($data[$field])) {
                $value = $data[$field];
                
                switch ($type) {
                    case 'email':
                        if (!isValidEmail($value)) {
                            $errors[$field] = 'Invalid email format';
                        }
                        break;
                    
                    case 'int':
                        if (!filter_var($value, FILTER_VALIDATE_INT)) {
                            $errors[$field] = 'Must be an integer';
                        }
                        break;
                    
                    case 'float':
                        if (!filter_var($value, FILTER_VALIDATE_FLOAT)) {
                            $errors[$field] = 'Must be a number';
                        }
                        break;
                    
                    case 'url':
                        if (!filter_var($value, FILTER_VALIDATE_URL)) {
                            $errors[$field] = 'Invalid URL format';
                        }
                        break;
                    
                    case 'string':
                        if (!is_string($value)) {
                            $errors[$field] = 'Must be a string';
                        }
                        break;
                    
                    case 'array':
                        if (!is_array($value)) {
                            $errors[$field] = 'Must be an array';
                        }
                        break;
                }
            }
        }
        
        if (!empty($errors)) {
            errorResponse('Validation failed', 400, $errors);
        }
        
        return $data;
    }
}
