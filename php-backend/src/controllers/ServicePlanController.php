<?php

namespace App\Controllers;

use App\Models\ServicePlan;
use App\Utils\Response;

class ServicePlanController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAll() {
        $servicePlan = new ServicePlan($this->db);
        $plans = $servicePlan->getAll();

        Response::success($plans);
    }

    public function getById($id) {
        $servicePlan = new ServicePlan($this->db);
        $plan = $servicePlan->getById($id);

        if ($plan) {
            Response::success($plan);
        }

        Response::error('Service plan not found', 404);
    }
}
