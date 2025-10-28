<?php // /api/cases/update.php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/case.php'; // Make sure CaseItem class has the updated update method
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$case = new CaseItem($db);

$user_id = $decoded->data->id;
$user_role = $decoded->data->role;
$data = json_decode(file_get_contents("php://input"));

// Validation remains the same
if (empty($data->id) || empty($data->title) || empty($data->client_id) || !isset($data->client_id) || empty($data->lawyer_id) || !isset($data->lawyer_id) || empty($data->case_type_id) || !isset($data->case_type_id) || !isset($data->status) || !isset($data->progress)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. ID, Title, Client, Lawyer, Case Type, Status, and Progress required."]);
    exit();
}

// Assign data remains the same
$case->id = $data->id;
$case->title = $data->title;
$case->description = $data->description ?? '';
$case->status = $data->status;
$case->progress = max(0, min(100, (int)$data->progress));
$case->client_id = $data->client_id;
$case->lawyer_id = $data->lawyer_id;
$case->case_type_id = $data->case_type_id;

// --- REVISED UPDATE CALL & ERROR HANDLING ---
$update_result = $case->update($user_id, $user_role); // Store the result

if ($update_result === true) { // Explicitly check for true (meaning rows were updated)
    $log_description = "Updated case: '" . htmlspecialchars($case->title) . "'";
    logActivity($db, $user_id, 'CASE_UPDATED', $log_description, 'case', $case->id);
    http_response_code(200);
    echo json_encode(["message" => "Case updated successfully."]);
} else if ($update_result === null) { // <<<--- ADDED CHECK FOR 'null' (or another distinct value)
    // --- This condition assumes you modify CaseItem::update to return null ---
    // --- specifically when rowCount is 0 but execute() was successful. ---
    // --- See modification below. ---
    http_response_code(200); // OK status
    echo json_encode(["message" => "Update processed, but no changes were detected."]);
}
else { // $update_result was explicitly false (permission/validation error)
    http_response_code(403); // Forbidden
    echo json_encode(["message" => "Update failed. Check permissions or if the lawyer is specialized for this case type."]);
}
// --- END REVISED HANDLING ---
?>