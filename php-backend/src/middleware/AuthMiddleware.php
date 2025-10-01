<?php

namespace App\Middleware;

use App\Utils\JWT;
use App\Utils\Response;

class AuthMiddleware {
    public static function authenticate() {
        $token = JWT::getBearerToken();

        if (!$token) {
            Response::error('No token provided', 401);
        }

        try {
            $decoded = JWT::decode($token);
            return $decoded;
        } catch (\Exception $e) {
            Response::error('Invalid or expired token', 401);
        }
    }
}
