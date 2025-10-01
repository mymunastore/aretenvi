<?php

namespace App\Models;

use PDO;

class WasteCollection {
    private $conn;
    private $table_name = "waste_collections";

    public $id;
    public $customer_id;
    public $subscription_id;
    public $scheduled_date;
    public $actual_collection_time;
    public $status;
    public $waste_type;
    public $estimated_weight;
    public $actual_weight;
    public $notes;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  (customer_id, subscription_id, scheduled_date, status, waste_type, estimated_weight, notes, created_at, updated_at)
                  VALUES (:customer_id, :subscription_id, :scheduled_date, :status, :waste_type, :estimated_weight, :notes, NOW(), NOW())";

        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(":customer_id", $this->customer_id);
        $stmt->bindParam(":subscription_id", $this->subscription_id);
        $stmt->bindParam(":scheduled_date", $this->scheduled_date);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":waste_type", $this->waste_type);
        $stmt->bindParam(":estimated_weight", $this->estimated_weight);
        $stmt->bindParam(":notes", $this->notes);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    public function getByCustomerId($customer_id, $limit = 10) {
        $query = "SELECT wc.*, c.full_name as customer_name, c.address
                  FROM " . $this->table_name . " wc
                  LEFT JOIN customers c ON wc.customer_id = c.id
                  WHERE wc.customer_id = :customer_id
                  ORDER BY wc.scheduled_date DESC
                  LIMIT :limit";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":customer_id", $customer_id);
        $stmt->bindParam(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus($id, $status, $notes = null) {
        $query = "UPDATE " . $this->table_name . "
                  SET status = :status,
                      notes = COALESCE(:notes, notes),
                      actual_collection_time = CASE WHEN :status = 'completed' THEN NOW() ELSE actual_collection_time END,
                      updated_at = NOW()
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":notes", $notes);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    public function getById($id) {
        $query = "SELECT wc.*, c.full_name as customer_name, c.address
                  FROM " . $this->table_name . " wc
                  LEFT JOIN customers c ON wc.customer_id = c.id
                  WHERE wc.id = :id LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }

        return null;
    }
}
