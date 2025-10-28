<?php
// /api/users/read.php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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

// Attempt to read all users (permission check is inside the read method)
$stmt = $user->read($requesting_role);

// Check if the read method returned a statement (i.e., permission granted)
if (!$stmt) {
    http_response_code(403); // Forbidden
    echo json_encode(["message" => "Access Denied. You do not have permission to view users."]);
    exit();
}

// Proceed if permission was granted
$num = $stmt->rowCount();

if ($num > 0) {
    $users_arr = ["records" => []];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $user_item = [
            "id" => $id,
            "first_name" => $first_name,
            "last_name" => $last_name,
            "email" => $email,
            "role" => $role,
            "created_at" => $created_at,
            "last_login" => $last_login,
            "specializations" => $specializations ? array_map('trim', explode(',', $specializations)) : []
        ];
        array_push($users_arr["records"], $user_item);
    }
    echo json_encode($users_arr);
} else {
    echo json_encode(["message" => "No users found."]);
}
?>
