<?php

namespace App\Controllers;

use App\Models\WasteCollection;
use App\Models\Customer;
use App\Utils\Response;

class WasteCollectionController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function create($user_data) {
        $input = json_decode(file_get_contents("php://input"));

        if (empty($input->scheduled_date) || empty($input->waste_type)) {
            Response::error('Scheduled date and waste type are required', 400);
        }

        $customerModel = new Customer($this->db);
        $customer = $customerModel->getByUserId($user_data['user_id']);

        if (!$customer) {
            Response::error('Customer profile not found', 404);
        }

        $collection = new WasteCollection($this->db);
        $collection->customer_id = $customer['id'];
        $collection->subscription_id = $input->subscription_id ?? null;
        $collection->scheduled_date = $input->scheduled_date;
        $collection->status = 'scheduled';
        $collection->waste_type = $input->waste_type;
        $collection->estimated_weight = $input->estimated_weight ?? null;
        $collection->notes = $input->notes ?? '';

        if ($collection->create()) {
            $created = $collection->getById($collection->id);
            Response::success($created, 'Collection scheduled successfully', 201);
        }

        Response::error('Failed to schedule collection', 500);
    }

    public function getByCustomer($user_data) {
        $customerModel = new Customer($this->db);
        $customer = $customerModel->getByUserId($user_data['user_id']);

        if (!$customer) {
            Response::error('Customer profile not found', 404);
        }

        $limit = $_GET['limit'] ?? 10;
        $collection = new WasteCollection($this->db);
        $collections = $collection->getByCustomerId($customer['id'], (int)$limit);

        Response::success($collections);
    }

    public function updateStatus($id, $user_data) {
        $input = json_decode(file_get_contents("php://input"));

        if (empty($input->status)) {
            Response::error('Status is required', 400);
        }

        $collection = new WasteCollection($this->db);
        $existing = $collection->getById($id);

        if (!$existing) {
            Response::error('Collection not found', 404);
        }

        $customerModel = new Customer($this->db);
        $customer = $customerModel->getByUserId($user_data['user_id']);

        if ($existing['customer_id'] != $customer['id']) {
            Response::error('Unauthorized', 403);
        }

        if ($collection->updateStatus($id, $input->status, $input->notes ?? null)) {
            $updated = $collection->getById($id);
            Response::success($updated, 'Collection status updated successfully');
        }

        Response::error('Failed to update collection status', 500);
    }
}
