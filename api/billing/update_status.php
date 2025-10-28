<?php // /api/billing/update_status.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/billing.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $billing = new Billing($db);
$user_id = $decoded->data->id; $user_role = $decoded->data->role; $data = json_decode(file_get_contents("php://input"));
if (!empty($data->id) && !empty($data->status)) {
    $billing->id = $data->id; $billing->status = $data->status;
    if ($billing->updateStatus($user_role)) {
        // --- UPDATED LOGGING (No ID in description) ---
        $log_description = "Updated status for a billing record to '" . htmlspecialchars($billing->status) . "'"; // More generic
        logActivity($db, $user_id, 'BILLING_STATUS_UPDATED', $log_description, 'billing', $billing->id);
        // --- END LOGGING ---
        http_response_code(200); echo json_encode(["message" => "Billing status updated."]);
    } else { http_response_code(403); echo json_encode(["message" => "Update failed. Permission denied or record not found."]); }
} else { http_response_code(400); echo json_encode(["message" => "ID and new status required."]); }
?>