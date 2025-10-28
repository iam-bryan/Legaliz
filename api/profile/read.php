<?php
// /api/profile/read.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/user.php';
require_once __DIR__ . '/../auth/validate_token.php'; // Secure the endpoint and get user ID from token

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

// Get the user ID from the validated token (stored in $decoded->data->id by validate_token.php)
$user->id = $decoded->data->id;

// Attempt to read the user's own profile using the readProfile method
try {
    if ($user->readProfile()) {
        $user_profile = [
            "id" => $user->id,
            "first_name" => $user->first_name,
            "last_name" => $user->last_name,
            "email" => $user->email,
            "role" => $user->role, // Good to return role for frontend logic
            "created_at" => $user->created_at,
            "last_login" => $user->last_login // May be null if user hasn't logged in since added
        ];
        http_response_code(200);
        echo json_encode($user_profile);
    } else {
        // This should theoretically not happen if the token is valid and user exists
        http_response_code(404);
        echo json_encode(["message" => "User profile not found."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error reading profile.",
        "error" => $e->getMessage()
    ]);
}
?>