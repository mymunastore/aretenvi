<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/database.php';

use App\Controllers\AuthController;
use App\Controllers\CustomerController;
use App\Controllers\ServicePlanController;
use App\Controllers\SubscriptionController;
use App\Controllers\WasteCollectionController;
use App\Middleware\AuthMiddleware;
use App\Middleware\CorsMiddleware;
use App\Utils\Response;

if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        list($name, $value) = explode('=', $line, 2);
        putenv(sprintf('%s=%s', trim($name), trim($value)));
    }
}

CorsMiddleware::handle();

header('Content-Type: application/json');

$database = new Database();
$db = $database->getConnection();

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$path_parts = array_filter(explode('/', $path));
$path_parts = array_values($path_parts);

try {
    if (empty($path_parts)) {
        Response::success(['message' => 'Waste Management API', 'version' => '1.0']);
    }

    $resource = $path_parts[0] ?? '';
    $id = $path_parts[1] ?? null;

    switch ($resource) {
        case 'auth':
            $authController = new AuthController($db);
            $action = $id ?? '';

            switch ($action) {
                case 'register':
                    if ($request_method === 'POST') {
                        $authController->register();
                    }
                    break;

                case 'login':
                    if ($request_method === 'POST') {
                        $authController->login();
                    }
                    break;

                case 'me':
                    if ($request_method === 'GET') {
                        $user_data = AuthMiddleware::authenticate();
                        $authController->getCurrentUser($user_data);
                    }
                    break;

                default:
                    Response::error('Invalid auth endpoint', 404);
            }
            break;

        case 'customers':
            $user_data = AuthMiddleware::authenticate();
            $customerController = new CustomerController($db);

            if ($request_method === 'GET') {
                $customerController->getProfile($user_data);
            } elseif ($request_method === 'PUT') {
                $customerController->updateProfile($user_data);
            } else {
                Response::error('Method not allowed', 405);
            }
            break;

        case 'service-plans':
            $servicePlanController = new ServicePlanController($db);

            if ($request_method === 'GET') {
                if ($id) {
                    $servicePlanController->getById($id);
                } else {
                    $servicePlanController->getAll();
                }
            } else {
                Response::error('Method not allowed', 405);
            }
            break;

        case 'subscriptions':
            $user_data = AuthMiddleware::authenticate();
            $subscriptionController = new SubscriptionController($db);

            if ($request_method === 'GET') {
                $subscriptionController->getByCustomer($user_data);
            } elseif ($request_method === 'POST') {
                $subscriptionController->create($user_data);
            } elseif ($request_method === 'PUT' && $id) {
                $subscriptionController->update($id, $user_data);
            } else {
                Response::error('Method not allowed', 405);
            }
            break;

        case 'collections':
            $user_data = AuthMiddleware::authenticate();
            $collectionController = new WasteCollectionController($db);

            if ($request_method === 'GET') {
                $collectionController->getByCustomer($user_data);
            } elseif ($request_method === 'POST') {
                if ($id === 'schedule') {
                    $collectionController->create($user_data);
                } else {
                    Response::error('Invalid endpoint', 404);
                }
            } elseif ($request_method === 'PUT' && $id) {
                $collectionController->updateStatus($id, $user_data);
            } else {
                Response::error('Method not allowed', 405);
            }
            break;

        default:
            Response::error('Resource not found', 404);
    }

} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    Response::error('Internal server error: ' . $e->getMessage(), 500);
}
