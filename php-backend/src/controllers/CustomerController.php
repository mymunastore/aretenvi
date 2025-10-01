<?php

namespace App\Controllers;

use App\Models\Customer;
use App\Utils\Response;

class CustomerController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getProfile($user_data) {
        $customer = new Customer($this->db);
        $data = $customer->getByUserId($user_data['user_id']);

        if ($data) {
            Response::success($data);
        }

        Response::error('Customer profile not found', 404);
    }

    public function updateProfile($user_data) {
        $input = json_decode(file_get_contents("php://input"));

        $customer = new Customer($this->db);
        $existing = $customer->getByUserId($user_data['user_id']);

        if (!$existing) {
            Response::error('Customer profile not found', 404);
        }

        $customer->full_name = $input->full_name ?? $existing['full_name'];
        $customer->email = $input->email ?? $existing['email'];
        $customer->phone = $input->phone ?? $existing['phone'];
        $customer->address = $input->address ?? $existing['address'];
        $customer->customer_type = $input->customer_type ?? $existing['customer_type'];
        $customer->account_status = $existing['account_status'];

        if ($customer->update($existing['id'])) {
            $updated = $customer->getById($existing['id']);
            Response::success($updated, 'Profile updated successfully');
        }

        Response::error('Failed to update profile', 500);
    }
}
