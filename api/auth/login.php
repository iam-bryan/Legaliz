<?php // /api/auth/login.php
ini_set('display_errors', 1); error_reporting(E_ALL);
require_once __DIR__ . '/../config/core.php'; // Includes functions.php now
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/user.php';
use \Firebase\JWT\JWT; // Make sure JWT library is loaded via core.php's autoload

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

// Basic validation
if (!isset($data->email) || !isset($data->password) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid input. Please provide a valid email and password."]);
    exit();
}

$user->email = $data->email;
$email_exists = $user->emailExists();

// Verify user exists and password is correct
if ($email_exists && password_verify($data->password, $user->password)) {

    // Prepare JWT token payload
    $token = [
        "iss" => $issuer,       // Issuer (from core.php)
        "aud" => $audience,     // Audience (from core.php)
        "iat" => $issued_at,    // Issued at timestamp (from core.php)
        "nbf" => $not_before,   // Not before timestamp (from core.php)
        "exp" => $expiration_time, // Expiration timestamp (from core.php)
        "data" => [             // User-specific data
            "id" => $user->id,
            "firstname" => $user->first_name,
            "lastname" => $user->last_name,
            "email" => $user->email,
            "role" => $user->role
        ]
    ];

    // Generate the JWT token
    $jwt = JWT::encode($token, $key, 'HS256'); // $key from core.php

    // --- logActivity CALL FOR USER_LOGIN REMOVED ---
    // logActivity($db, $user->id, 'USER_LOGIN', "User logged in.", 'user', $user->id); // <-- This line is now removed/commented out

    // Send successful response
    http_response_code(200);
    echo json_encode([
        "message" => "Successful login.",
        "jwt" => $jwt,
        "user" => [ // Send back basic user info for the frontend
            "id" => $user->id,
            "name" => trim($user->first_name . ' ' . $user->last_name),
            "email" => $user->email,
            "role" => $user->role
        ],
        "expiry" => $expiration_time // Send expiry time for potential frontend use
    ]);

} else {
    // Login failed (wrong email or password)
    http_response_code(401); // Unauthorized
    echo json_encode(["message" => "Login failed. Invalid credentials."]);
}
?>