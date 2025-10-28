<?php
// /api/users/read_one.php

// Required headers and configuration
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/user.php';

// Validate the JWT to secure the endpoint
require_once __DIR__ . '/../auth/validate_token.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate user object
$user = new User($db);

// Get the role of the user making the request from the decoded token
$requesting_role = $decoded->data->role;

// Get the user ID from the URL query string
$user->id = isset($_GET['id']) ? $_GET['id'] : die(); // Use die() if ID is not provided

// Attempt to read the user details (permission check is inside the readOne method)
if ($user->readOne($requesting_role)) {
    // Create an array with user details (excluding password)
    $user_details = [
        "id" => $user->id,
        "first_name" => $user->first_name,
        "last_name" => $user->last_name,
        "email" => $user->email,
        "role" => $user->role,
        "created_at" => $user->created_at,
        "last_login" => $user->last_login
    ];

    http_response_code(200);
    echo json_encode($user_details);
} else {
    // If readOne returns false, user either doesn't exist or permission denied
    http_response_code(404); // Use 404 Not Found for both scenarios
    echo json_encode(["message" => "User not found or access denied."]);
}
?>