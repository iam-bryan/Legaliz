<?php // /api/cases/delete.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/case.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $case = new CaseItem($db);
$user_id = $decoded->data->id; $user_role = $decoded->data->role; $data = json_decode(file_get_contents("php://input"));
if (empty($data->id)) { http_response_code(400); echo json_encode(["message" => "Case ID required."]); exit(); }
$case->id = $data->id;
if ($case->delete($user_role)) {
    // --- LOGGING (No change needed, description is just the ID) ---
    logActivity($db, $user_id, 'CASE_DELETED', "Deleted case ID: {$case->id}", 'case', $case->id);
    // --- END LOGGING ---
    http_response_code(200); echo json_encode(["message" => "Case deleted."]);
} else { http_response_code(403); echo json_encode(["message" => "Delete failed. No permission or case not found."]); }
?>