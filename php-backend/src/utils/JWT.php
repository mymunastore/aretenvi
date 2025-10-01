<?php

namespace App\Utils;

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;
use Exception;

class JWT {
    private static $secret_key;
    private static $expiry;

    public static function init() {
        self::$secret_key = getenv('JWT_SECRET') ?: 'default-secret-key-change-in-production';
        self::$expiry = getenv('JWT_EXPIRY') ?: 86400;
    }

    public static function encode($user_id, $email) {
        self::init();

        $issued_at = time();
        $expiration_time = $issued_at + self::$expiry;

        $payload = array(
            'iss' => 'waste-management-api',
            'iat' => $issued_at,
            'exp' => $expiration_time,
            'user_id' => $user_id,
            'email' => $email
        );

        return FirebaseJWT::encode($payload, self::$secret_key, 'HS256');
    }

    public static function decode($jwt) {
        self::init();

        try {
            $decoded = FirebaseJWT::decode($jwt, new Key(self::$secret_key, 'HS256'));
            return (array) $decoded;
        } catch (Exception $e) {
            throw new Exception('Invalid token: ' . $e->getMessage());
        }
    }

    public static function getBearerToken() {
        $headers = apache_request_headers();

        if (isset($headers['Authorization'])) {
            $matches = array();
            if (preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches)) {
                return $matches[1];
            }
        }

        return null;
    }
}
