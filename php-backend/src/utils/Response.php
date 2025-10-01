<?php

namespace App\Utils;

class Response {
    public static function json($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit();
    }

    public static function success($data = null, $message = 'Success', $status_code = 200) {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $status_code);
    }

    public static function error($message, $status_code = 400, $errors = null) {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        self::json($response, $status_code);
    }
}
