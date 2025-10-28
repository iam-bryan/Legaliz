<?php
// /api/cases/read_one.php

// Required headers
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/case.php';

// Validate JWT
require_once __DIR__ . '/../auth/validate_token.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate case object
$case = new CaseItem($db);

// Get posted data (case ID)
$case->id = isset($_GET['id']) ? $_GET['id'] : die();

// Get user details from token
$user_id = $decoded->data->id;
$role = $decoded->data->role;

// Read the details of case
if ($case->readOne($user_id, $role)) {
    $case_arr = array(
        "id" => $case->id,
        "title" => $case->title,
        "description" => $case->description,
        "client_id" => $case->client_id,
        "client_name" => $case->client_name,
        "lawyer_id" => $case->lawyer_id,
        "lawyer_name" => $case->lawyer_name,
        "case_type_id" => $case->case_type_id,
        "case_type_name" => $case->case_type_name,
        "status" => $case->status, // <-- Kept
        "case_stage" => $case->case_stage, // <-- ADDED
        // "progress" => $case->progress, // <-- REMOVED
        "created_at" => $case->created_at
    );
    http_response_code(200);
    echo json_encode($case_arr);
} else {
    http_response_code(404); // Not found or no permission
    echo json_encode(array("message" => "Case not found or access denied."));
}
?>