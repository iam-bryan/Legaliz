<?php // /api/billing/delete.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/billing.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $billing = new Billing($db);
$user_id = $decoded->data->id; $user_role = $decoded->data->role; $data = json_decode(file_get_contents("php://input"));
if (!empty($data->id)) {
    $billing->id = $data->id;
    if ($billing->delete($user_role)) {
         // --- LOGGING (No change needed) ---
        logActivity($db, $user_id, 'BILLING_DELETED', "Deleted billing record ID: {$billing->id}", 'billing', $billing->id);
        // --- END LOGGING ---
        http_response_code(200); echo json_encode(["message" => "Billing record deleted."]);
    } else { http_response_code(403); echo json_encode(["message" => "Delete failed. Permission denied or record not found."]); }
} else { http_response_code(400); echo json_encode(["message" => "Billing record ID missing."]); }
?>