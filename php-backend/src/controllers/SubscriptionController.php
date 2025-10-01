<?php

namespace App\Controllers;

use App\Models\Subscription;
use App\Models\Customer;
use App\Utils\Response;

class SubscriptionController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function create($user_data) {
        $input = json_decode(file_get_contents("php://input"));

        if (empty($input->service_plan_id)) {
            Response::error('Service plan ID is required', 400);
        }

        $customerModel = new Customer($this->db);
        $customer = $customerModel->getByUserId($user_data['user_id']);

        if (!$customer) {
            Response::error('Customer profile not found', 404);
        }

        $subscription = new Subscription($this->db);
        $subscription->customer_id = $customer['id'];
        $subscription->service_plan_id = $input->service_plan_id;
        $subscription->start_date = $input->start_date ?? date('Y-m-d');
        $subscription->end_date = $input->end_date ?? null;
        $subscription->status = 'active';
        $subscription->billing_cycle = $input->billing_cycle ?? 'monthly';
        $subscription->next_billing_date = date('Y-m-d', strtotime('+1 month'));

        if ($subscription->create()) {
            $created = $subscription->getById($subscription->id);
            Response::success($created, 'Subscription created successfully', 201);
        }

        Response::error('Failed to create subscription', 500);
    }

    public function getByCustomer($user_data) {
        $customerModel = new Customer($this->db);
        $customer = $customerModel->getByUserId($user_data['user_id']);

        if (!$customer) {
            Response::error('Customer profile not found', 404);
        }

        $subscription = new Subscription($this->db);
        $subscriptions = $subscription->getByCustomerId($customer['id']);

        Response::success($subscriptions);
    }

    public function update($id, $user_data) {
        $input = json_decode(file_get_contents("php://input"));

        $subscription = new Subscription($this->db);
        $existing = $subscription->getById($id);

        if (!$existing) {
            Response::error('Subscription not found', 404);
        }

        $customerModel = new Customer($this->db);
        $customer = $customerModel->getByUserId($user_data['user_id']);

        if ($existing['customer_id'] != $customer['id']) {
            Response::error('Unauthorized', 403);
        }

        $subscription->status = $input->status ?? $existing['status'];
        $subscription->end_date = $input->end_date ?? $existing['end_date'];
        $subscription->next_billing_date = $input->next_billing_date ?? $existing['next_billing_date'];

        if ($subscription->update($id)) {
            $updated = $subscription->getById($id);
            Response::success($updated, 'Subscription updated successfully');
        }

        Response::error('Failed to update subscription', 500);
    }
}
