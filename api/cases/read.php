<?php
// /api/cases/read.php

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

// Get user details from the validated token payload
$user_id = $decoded->data->id;
$role = $decoded->data->role;

// Query cases based on user role
$stmt = $case->read($user_id, $role);
$num = $stmt->rowCount();

if ($num > 0) {
    $cases_arr = array();
    $cases_arr["records"] = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $case_item = array(
            "id" => $id,
            "title" => $title,
            "client_name" => $client_name,
            "lawyer_name" => $lawyer_name,
            "case_type_name" => $case_type_name,
            "status" => $status, 
            "case_stage" => $case_stage, // Correctly added
            "created_at" => $created_at
        );
        array_push($cases_arr["records"], $case_item);
    }

    http_response_code(200);
    echo json_encode($cases_arr);
} else {
    // --- THIS IS THE MISSING OR INCOMPLETE BLOCK ---
    http_response_code(200); // Use 200 OK even if no records found
    echo json_encode(
        array("records" => [], "message" => "No cases found.")
    );
}
?>