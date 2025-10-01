<?php

namespace App\Models;

use PDO;

class Subscription {
    private $conn;
    private $table_name = "customer_subscriptions";

    public $id;
    public $customer_id;
    public $service_plan_id;
    public $start_date;
    public $end_date;
    public $status;
    public $billing_cycle;
    public $next_billing_date;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  (customer_id, service_plan_id, start_date, end_date, status, billing_cycle, next_billing_date, created_at, updated_at)
                  VALUES (:customer_id, :service_plan_id, :start_date, :end_date, :status, :billing_cycle, :next_billing_date, NOW(), NOW())";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":customer_id", $this->customer_id);
        $stmt->bindParam(":service_plan_id", $this->service_plan_id);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":billing_cycle", $this->billing_cycle);
        $stmt->bindParam(":next_billing_date", $this->next_billing_date);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    public function getByCustomerId($customer_id) {
        $query = "SELECT s.*, sp.name as plan_name, sp.description, sp.price_monthly, sp.price_annual, sp.features
                  FROM " . $this->table_name . " s
                  LEFT JOIN service_plans sp ON s.service_plan_id = sp.id
                  WHERE s.customer_id = :customer_id AND s.status = 'active'
                  ORDER BY s.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":customer_id", $customer_id);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($id) {
        $query = "UPDATE " . $this->table_name . "
                  SET status = :status,
                      end_date = :end_date,
                      next_billing_date = :next_billing_date,
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":next_billing_date", $this->next_billing_date);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    public function getById($id) {
        $query = "SELECT s.*, sp.name as plan_name, sp.description, sp.price_monthly, sp.price_annual, sp.features
                  FROM " . $this->table_name . " s
                  LEFT JOIN service_plans sp ON s.service_plan_id = sp.id
                  WHERE s.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        return null;
    }
}
