<?php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/billing.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$billing = new Billing($db);

$user_role = $decoded->data->role;
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->case_id) && !empty($data->amount) && !empty($data->description)) {
    $billing->case_id = $data->case_id;
    $billing->amount = $data->amount;
    $billing->description = $data->description;
    $billing->due_date = $data->due_date ?? null;

    if ($billing->create($user_role)) {
        http_response_code(201);
        echo json_encode(["message" => "Billing record was created."]);
    } else {
        http_response_code(403);
        echo json_encode(["message" => "Unable to create billing record. You may not have permission."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to create billing record. Data is incomplete."]);
}
?>