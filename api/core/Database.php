<?php

declare(strict_types=1);

namespace SkySoft\Core;

use PDO;
use PDOException;
use Exception;

/**
 * Database Connection Class - Singleton Pattern
 * 
 * Professional database connection manager using PDO with proper error handling,
 * connection pooling, and security measures.
 */
class Database
{
    private static ?PDO $instance = null;
    private static array $config = [];
    private static bool $connected = false;

    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct() {}

    /**
     * Private clone method to prevent cloning
     */
    private function __clone() {}

    /**
     * Private unserialize method to prevent unserializing
     */
    public function __wakeup(): void
    {
        throw new Exception("Cannot unserialize singleton");
    }

    /**
     * Set database configuration
     * 
     * @param array $config Database configuration array
     */
    public static function setConfig(array $config): void
    {
        self::$config = array_merge([
            'host' => 'localhost',
            'port' => '3306',
            'dbname' => 'skysoft_agency',
            'charset' => 'utf8mb4',
            'username' => 'root',
            'password' => '',
            'options' => [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                PDO::ATTR_TIMEOUT => 30,
                PDO::ATTR_PERSISTENT => false
            ]
        ], $config);
    }

    /**
     * Get database instance (Singleton pattern)
     * 
     * @return PDO Database connection instance
     * @throws PDOException If connection fails
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null || !self::$connected) {
            self::initializeConnection();
        }

        return self::$instance;
    }

    /**
     * Initialize database connection
     * 
     * @throws PDOException If connection fails
     */
    private static function initializeConnection(): void
    {
        try {
            // Load configuration from environment if available
            if (empty(self::$config)) {
                self::loadFromEnvironment();
            }

            // Validate required configuration
            self::validateConfig();

            // Build DSN string
            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=%s',
                self::$config['host'],
                self::$config['port'],
                self::$config['dbname'],
                self::$config['charset']
            );

            // Create PDO instance
            self::$instance = new PDO(
                $dsn,
                self::$config['username'],
                self::$config['password'],
                self::$config['options']
            );

            self::$connected = true;

            // Log successful connection (in production, use proper logging)
            error_log("Database connection established successfully");

        } catch (PDOException $e) {
            self::$connected = false;
            self::$instance = null;
            
            // Log error details
            error_log("Database connection failed: " . $e->getMessage());
            
            // Re-throw with user-friendly message
            throw new PDOException("Database connection failed. Please check your configuration.");
        }
    }

    /**
     * Load configuration from environment variables
     */
    private static function loadFromEnvironment(): void
    {
        self::$config = [
            'host' => $_ENV['DB_HOST'] ?? 'localhost',
            'port' => $_ENV['DB_PORT'] ?? '3306',
            'dbname' => $_ENV['DB_NAME'] ?? 'skysoft_agency',
            'charset' => $_ENV['DB_CHARSET'] ?? 'utf8mb4',
            'username' => $_ENV['DB_USER'] ?? 'root',
            'password' => $_ENV['DB_PASSWORD'] ?? '',
            'options' => [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
                PDO::ATTR_TIMEOUT => 30
            ]
        ];
    }

    /**
     * Validate database configuration
     * 
     * @throws Exception If configuration is invalid
     */
    private static function validateConfig(): void
    {
        $required = ['host', 'dbname', 'username'];
        
        foreach ($required as $key) {
            if (empty(self::$config[$key])) {
                throw new Exception("Database configuration missing required field: {$key}");
            }
        }
    }

    /**
     * Close database connection
     */
    public static function closeConnection(): void
    {
        if (self::$instance !== null) {
            self::$instance = null;
            self::$connected = false;
            error_log("Database connection closed");
        }
    }

    /**
     * Check if database is connected
     * 
     * @return bool Connection status
     */
    public static function isConnected(): bool
    {
        return self::$connected && self::$instance !== null;
    }

    /**
     * Begin database transaction
     * 
     * @return bool Success status
     */
    public static function beginTransaction(): bool
    {
        try {
            return self::getInstance()->beginTransaction();
        } catch (PDOException $e) {
            error_log("Transaction begin failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Commit database transaction
     * 
     * @return bool Success status
     */
    public static function commit(): bool
    {
        try {
            return self::getInstance()->commit();
        } catch (PDOException $e) {
            error_log("Transaction commit failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Rollback database transaction
     * 
     * @return bool Success status
     */
    public static function rollback(): bool
    {
        try {
            return self::getInstance()->rollBack();
        } catch (PDOException $e) {
            error_log("Transaction rollback failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get last inserted ID
     * 
     * @return string Last inserted ID
     */
    public static function getLastInsertId(): string
    {
        return self::getInstance()->lastInsertId();
    }

    /**
     * Execute prepared statement with error handling
     * 
     * @param string $query SQL query
     * @param array $params Query parameters
     * @return PDOStatement|false Statement or false on failure
     */
    public static function execute(string $query, array $params = []): PDOStatement|false
    {
        try {
            $stmt = self::getInstance()->prepare($query);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query execution failed: " . $e->getMessage() . " Query: " . $query);
            return false;
        }
    }

    /**
     * Fetch single record
     * 
     * @param string $query SQL query
     * @param array $params Query parameters
     * @return array|false Record data or false on failure
     */
    public static function fetch(string $query, array $params = []): array|false
    {
        $stmt = self::execute($query, $params);
        return $stmt ? $stmt->fetch() : false;
    }

    /**
     * Fetch multiple records
     * 
     * @param string $query SQL query
     * @param array $params Query parameters
     * @return array Records array
     */
    public static function fetchAll(string $query, array $params = []): array
    {
        $stmt = self::execute($query, $params);
        return $stmt ? $stmt->fetchAll() : [];
    }

    /**
     * Insert record and return last insert ID
     * 
     * @param string $table Table name
     * @param array $data Data to insert
     * @return string|false Last insert ID or false on failure
     */
    public static function insert(string $table, array $data): string|false
    {
        $columns = implode(',', array_keys($data));
        $placeholders = implode(',', array_fill(0, count($data), '?'));
        
        $query = "INSERT INTO {$table} ({$columns}) VALUES ({$placeholders})";
        
        if (self::execute($query, array_values($data))) {
            return self::getLastInsertId();
        }
        
        return false;
    }

    /**
     * Update record
     * 
     * @param string $table Table name
     * @param array $data Data to update
     * @param string $where WHERE condition
     * @param array $whereParams WHERE parameters
     * @return bool Success status
     */
    public static function update(string $table, array $data, string $where, array $whereParams = []): bool
    {
        $setClause = [];
        $params = [];
        
        foreach ($data as $column => $value) {
            $setClause[] = "{$column} = ?";
            $params[] = $value;
        }
        
        $params = array_merge($params, $whereParams);
        $setClause = implode(', ', $setClause);
        
        $query = "UPDATE {$table} SET {$setClause} WHERE {$where}";
        
        return self::execute($query, $params) !== false;
    }

    /**
     * Delete record
     * 
     * @param string $table Table name
     * @param string $where WHERE condition
     * @param array $params WHERE parameters
     * @return bool Success status
     */
    public static function delete(string $table, string $where, array $params = []): bool
    {
        $query = "DELETE FROM {$table} WHERE {$where}";
        return self::execute($query, $params) !== false;
    }

    /**
     * Test database connection
     * 
     * @return bool Connection test result
     */
    public static function testConnection(): bool
    {
        try {
            $stmt = self::getInstance()->query("SELECT 1");
            return $stmt->fetchColumn() === '1';
        } catch (PDOException $e) {
            error_log("Database connection test failed: " . $e->getMessage());
            return false;
        }
    }
}
