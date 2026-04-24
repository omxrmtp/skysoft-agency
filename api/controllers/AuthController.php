<?php

declare(strict_types=1);

namespace SkySoft\Controllers;

use SkySoft\Core\Database;
use SkySoft\Middleware\AuthMiddleware;
use SkySoft\Middleware\SecurityMiddleware;

/**
 * Authentication Controller
 * 
 * Handles user authentication and session management
 */
class AuthController
{
    /**
     * User login
     */
    public static function login(): void
    {
        // Get and validate input
        $data = Router::requireParams(['email', 'password']);
        $data = Router::validateTypes([
            'email' => 'email',
            'password' => 'string'
        ], $data);

        // Find user by email
        $user = Database::fetch(
            "SELECT id, nombre, email, password_hash, rol, activo FROM usuarios_admin WHERE email = ?",
            [$data['email']]
        );

        if (!$user) {
            SecurityMiddleware::logSecurityEvent('Login attempt - user not found', [
                'email' => $data['email']
            ]);
            errorResponse('Invalid credentials', 401);
        }

        // Check if user is active
        if (!$user['activo']) {
            SecurityMiddleware::logSecurityEvent('Login attempt - inactive user', [
                'user_id' => $user['id'],
                'email' => $data['email']
            ]);
            errorResponse('Account is disabled', 403);
        }

        // Verify password
        if (!password_verify($data['password'], $user['password_hash'])) {
            SecurityMiddleware::logSecurityEvent('Login attempt - wrong password', [
                'user_id' => $user['id'],
                'email' => $data['email']
            ]);
            errorResponse('Invalid credentials', 401);
        }

        // Remove password hash from response
        unset($user['password_hash']);

        // Generate JWT token
        $token = AuthMiddleware::generateToken($user);

        // Update last login
        Database::update(
            'usuarios_admin',
            ['ultimo_login' => date('Y-m-d H:i:s')],
            'id = ?',
            [$user['id']]
        );

        // Log successful login
        SecurityMiddleware::logSecurityEvent('Login successful', [
            'user_id' => $user['id'],
            'email' => $user['email']
        ]);

        successResponse('Login successful', [
            'user' => $user,
            'token' => $token,
            'expires_in' => JWT_EXPIRE_TIME
        ]);
    }

    /**
     * User logout
     */
    public static function logout(): void
    {
        // For JWT, logout is client-side (token deletion)
        // For session-based auth, we would destroy the session
        
        // Get current user if authenticated
        $user = AuthMiddleware::authenticate();
        
        if ($user) {
            SecurityMiddleware::logSecurityEvent('Logout', [
                'user_id' => $user['id'],
                'email' => $user['email']
            ]);
        }

        successResponse('Logout successful');
    }

    /**
     * Get current user info
     */
    public static function me(): void
    {
        $user = AuthMiddleware::requireAuth();
        
        successResponse('User info retrieved successfully', $user);
    }

    /**
     * Refresh JWT token
     */
    public static function refresh(): void
    {
        $user = AuthMiddleware::requireAuth();
        
        // Generate new token
        $token = AuthMiddleware::generateToken($user);
        
        successResponse('Token refreshed successfully', [
            'token' => $token,
            'expires_in' => JWT_EXPIRE_TIME
        ]);
    }

    /**
     * Change password
     */
    public static function changePassword(): void
    {
        $user = AuthMiddleware::requireAuth();
        
        // Get and validate input
        $data = Router::requireParams(['current_password', 'new_password']);
        $data = Router::validateTypes([
            'current_password' => 'string',
            'new_password' => 'string'
        ], $data);

        // Validate new password strength
        if (strlen($data['new_password']) < 8) {
            errorResponse('New password must be at least 8 characters long', 400);
        }

        // Get current password hash
        $currentUser = Database::fetch(
            "SELECT password_hash FROM usuarios_admin WHERE id = ?",
            [$user['id']]
        );

        if (!$currentUser) {
            errorResponse('User not found', 404);
        }

        // Verify current password
        if (!password_verify($data['current_password'], $currentUser['password_hash'])) {
            SecurityMiddleware::logSecurityEvent('Password change - wrong current password', [
                'user_id' => $user['id']
            ]);
            errorResponse('Current password is incorrect', 401);
        }

        // Hash new password
        $newPasswordHash = password_hash($data['new_password'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);

        // Update password
        $success = Database::update(
            'usuarios_admin',
            ['password_hash' => $newPasswordHash],
            'id = ?',
            [$user['id']]
        );

        if (!$success) {
            errorResponse('Failed to update password', 500);
        }

        // Log password change
        SecurityMiddleware::logSecurityEvent('Password changed', [
            'user_id' => $user['id']
        ]);

        successResponse('Password changed successfully');
    }

    /**
     * Create new admin user (super admin only)
     */
    public static function createUser(): void
    {
        // Require super admin role
        AuthMiddleware::requireRole(['super_admin']);

        // Get and validate input
        $data = Router::requireParams(['nombre', 'email', 'password', 'rol']);
        $data = Router::validateTypes([
            'nombre' => 'string',
            'email' => 'email',
            'password' => 'string',
            'rol' => 'string'
        ], $data);

        // Validate role
        $validRoles = ['super_admin', 'admin', 'editor'];
        if (!in_array($data['rol'], $validRoles)) {
            errorResponse('Invalid role. Must be: ' . implode(', ', $validRoles), 400);
        }

        // Validate password strength
        if (strlen($data['password']) < 8) {
            errorResponse('Password must be at least 8 characters long', 400);
        }

        // Check if email already exists
        $existingUser = Database::fetch(
            "SELECT id FROM usuarios_admin WHERE email = ?",
            [$data['email']]
        );

        if ($existingUser) {
            errorResponse('Email already exists', 409);
        }

        // Hash password
        $passwordHash = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);

        // Create user
        $userData = [
            'nombre' => $data['nombre'],
            'email' => $data['email'],
            'password_hash' => $passwordHash,
            'rol' => $data['rol'],
            'activo' => 1
        ];

        $userId = Database::insert('usuarios_admin', $userData);

        if (!$userId) {
            errorResponse('Failed to create user', 500);
        }

        // Log user creation
        SecurityMiddleware::logSecurityEvent('User created', [
            'new_user_id' => $userId,
            'new_user_email' => $data['email'],
            'role' => $data['rol']
        ]);

        // Get created user (without password)
        $createdUser = Database::fetch(
            "SELECT id, nombre, email, rol, activo, created_at FROM usuarios_admin WHERE id = ?",
            [$userId]
        );

        successResponse('User created successfully', $createdUser);
    }

    /**
     * Get all users (admin only)
     */
    public static function getUsers(): void
    {
        AuthMiddleware::requireRole(['super_admin', 'admin']);

        $page = (int)($_GET['page'] ?? 1);
        $limit = (int)($_GET['limit'] ?? 20);
        $role = $_GET['role'] ?? null;
        $active = $_GET['active'] ?? null;

        $offset = ($page - 1) * $limit;

        // Build query
        $whereConditions = [];
        $queryParams = [];

        if ($role) {
            $whereConditions[] = "rol = ?";
            $queryParams[] = $role;
        }

        if ($active !== null) {
            $whereConditions[] = "activo = ?";
            $queryParams[] = $active === 'true' ? 1 : 0;
        }

        $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

        // Get total count
        $countQuery = "SELECT COUNT(*) as total FROM usuarios_admin {$whereClause}";
        $totalResult = Database::fetch($countQuery, $queryParams);
        $total = (int)($totalResult['total'] ?? 0);

        // Get users
        $query = "
            SELECT 
                id,
                nombre,
                email,
                rol,
                activo,
                ultimo_login,
                created_at
            FROM usuarios_admin
            {$whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ";

        $queryParams[] = $limit;
        $queryParams[] = $offset;

        $users = Database::fetchAll($query, $queryParams);

        successResponse('Users retrieved successfully', [
            'users' => $users,
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
     * Update user status (admin only)
     */
    public static function updateUserStatus(array $params): void
    {
        AuthMiddleware::requireRole(['super_admin', 'admin']);

        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            errorResponse('Invalid user ID', 400);
        }

        // Get and validate input
        $data = Router::requireParams(['activo']);
        $data = Router::validateTypes([
            'activo' => 'int'
        ], $data);

        // Check if user exists
        $user = Database::fetch("SELECT nombre, email, rol FROM usuarios_admin WHERE id = ?", [$id]);
        if (!$user) {
            errorResponse('User not found', 404);
        }

        // Prevent deactivating super admin (unless you're super admin)
        $currentUser = AuthMiddleware::requireAuth();
        if ($user['rol'] === 'super_admin' && $currentUser['rol'] !== 'super_admin') {
            errorResponse('Cannot modify super admin account', 403);
        }

        // Update user
        $success = Database::update('usuarios_admin', ['activo' => $data['activo']], 'id = ?', [$id]);

        if (!$success) {
            errorResponse('Failed to update user status', 500);
        }

        // Log status change
        SecurityMiddleware::logSecurityEvent('User status updated', [
            'target_user_id' => $id,
            'target_user_email' => $user['email'],
            'new_status' => $data['activo'] ? 'active' : 'inactive',
            'updated_by' => $currentUser['id']
        ]);

        successResponse('User status updated successfully');
    }

    /**
     * Delete user (super admin only)
     */
    public static function deleteUser(array $params): void
    {
        AuthMiddleware::requireRole(['super_admin']);

        $id = (int)($params['id'] ?? 0);

        if ($id <= 0) {
            errorResponse('Invalid user ID', 400);
        }

        // Check if user exists
        $user = Database::fetch("SELECT nombre, email, rol FROM usuarios_admin WHERE id = ?", [$id]);
        if (!$user) {
            errorResponse('User not found', 404);
        }

        // Prevent deleting yourself
        $currentUser = AuthMiddleware::requireAuth();
        if ($id === $currentUser['id']) {
            errorResponse('Cannot delete your own account', 403);
        }

        // Delete user
        $success = Database::delete('usuarios_admin', 'id = ?', [$id]);

        if (!$success) {
            errorResponse('Failed to delete user', 500);
        }

        // Log user deletion
        SecurityMiddleware::logSecurityEvent('User deleted', [
            'deleted_user_id' => $id,
            'deleted_user_email' => $user['email'],
            'deleted_by' => $currentUser['id']
        ]);

        successResponse('User deleted successfully');
    }
}
