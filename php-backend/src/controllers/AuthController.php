<?php

namespace App\Controllers;

use App\Models\User;
use App\Models\Customer;
use App\Utils\JWT;
use App\Utils\Response;

class AuthController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || empty($data->password) || empty($data->full_name) || empty($data->phone)) {
            Response::error('Missing required fields', 400);
        }

        if (!filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
            Response::error('Invalid email format', 400);
        }

        if (strlen($data->password) < 6) {
            Response::error('Password must be at least 6 characters', 400);
        }

        $user = new User($this->db);
        $user->email = $data->email;

        if ($user->emailExists()) {
            Response::error('Email already exists', 409);
        }

        $user->password = $data->password;
        $user->full_name = $data->full_name;
        $user->phone = $data->phone;
        $user->address = $data->address ?? '';

        if ($user->create()) {
            $customer = new Customer($this->db);
            $customer->user_id = $user->id;
            $customer->full_name = $user->full_name;
            $customer->email = $user->email;
            $customer->phone = $user->phone;
            $customer->address = $user->address;
            $customer->customer_type = 'residential';
            $customer->account_status = 'active';
            $customer->create();

            $token = JWT::encode($user->id, $user->email);

            Response::success([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'full_name' => $user->full_name,
                    'phone' => $user->phone
                ]
            ], 'Registration successful', 201);
        }

        Response::error('Registration failed', 500);
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || empty($data->password)) {
            Response::error('Email and password are required', 400);
        }

        $user = new User($this->db);
        $user->email = $data->email;

        if (!$user->emailExists()) {
            Response::error('Invalid credentials', 401);
        }

        if (!$user->verifyPassword($data->password)) {
            Response::error('Invalid credentials', 401);
        }

        $token = JWT::encode($user->id, $user->email);

        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'phone' => $user->phone
            ]
        ], 'Login successful');
    }

    public function getCurrentUser($user_data) {
        $user = new User($this->db);

        if ($user->getById($user_data['user_id'])) {
            Response::success([
                'id' => $user->id,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'phone' => $user->phone,
                'address' => $user->address
            ]);
        }

        Response::error('User not found', 404);
    }
}
