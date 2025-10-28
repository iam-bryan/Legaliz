<?php
// /api/auth/validate_token.php

// Required to use the JWT library
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

// Get the shared secret key from the core configuration file
require_once __DIR__ . '/../config/core.php';

// Get the Authorization header from the request
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;

// Check if the JWT is provided in the Authorization header
if (!$authHeader) {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. No token provided."]);
    exit();
}

// Extract the token from the "Bearer " scheme
$jwt = null;
if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $jwt = $matches[1];
}

if (!$jwt) {
    http_response_code(401);
    echo json_encode(["message" => "Access denied. Token format is invalid."]);
    exit();
}

// Try to decode the JWT
try {
    // The JWT::decode function will automatically handle expiration and signature verification.
    // It will throw an exception if the token is invalid for any reason.
    $decoded = JWT::decode($jwt, new Key($key, 'HS256'));

} catch (Exception $e) {
    // If decoding fails, the token is invalid
    http_response_code(401);
    echo json_encode([
        "message" => "Access denied. Invalid or expired token.",
        "error" => $e->getMessage()
    ]);
    exit();
}
?>