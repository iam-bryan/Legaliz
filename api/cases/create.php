<?php // /api/cases/create.php
ini_set('display_errors', 1); error_reporting(E_ALL);
require_once __DIR__ . '/../config/core.php'; // Includes functions.php now
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/case.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database(); $db = $database->getConnection(); $case = new CaseItem($db);
$user_role = $decoded->data->role; $user_id = $decoded->data->id;
$data = json_decode(file_get_contents("php://input"));

// --- UPDATED VALIDATION (Lawyer ID is now optional) ---
// We still require title, client_id, and case_type_id
if (empty($data->title) || empty($data->client_id) || !isset($data->client_id) || empty($data->case_type_id) || !isset($data->case_type_id)) {
    http_response_code(400);
    // Updated error message
    echo json_encode(["message" => "Incomplete data. Title, client ID, and case type ID required."]);
    exit();
}
// --- END UPDATED VALIDATION ---

try {
    $case->title = $data->title;
    $case->description = $data->description ?? '';
    $case->client_id = $data->client_id;
    // Assign lawyer_id only if it's provided and not empty
    $case->lawyer_id = (!empty($data->lawyer_id) && isset($data->lawyer_id)) ? $data->lawyer_id : null;
    $case->case_type_id = $data->case_type_id;

    // The create method now handles null lawyer_id and skips specialization check if null
    if ($case->create($user_role)) {
        $log_description = "Created case: '" . htmlspecialchars($case->title) . "'";
        logActivity($db, $user_id, 'CASE_CREATED', $log_description, 'case', $case->id);
        http_response_code(201);
        echo json_encode(["message" => "Case created.", "case_id" => $case->id]);
    } else {
        // More specific error message if validation might be the cause
        http_response_code(400); // Bad Request might be better if validation fails
        echo json_encode(["message" => "Failed to create case. Check permissions or ensure the selected lawyer (if any) is specialized for this case type."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error creating case.", "error" => $e->getMessage()]);
}
?>