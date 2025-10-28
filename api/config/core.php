<?php
// /api/config/core.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

date_default_timezone_set('Asia/Manila');

// --- ROBUST CORS HANDLING FOR LOCAL DEVELOPMENT ---
if (isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] == 'http://localhost:3000') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
} else {
    header("Access-Control-Allow-Origin: *"); // Fallback for direct access or other origins
}
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Ensure Authorization is listed
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400"); // Cache preflight response for 1 day

// Handle browser's pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// --- JWT CONFIGURATION FOR LOCAL DEVELOPMENT ---
$key = "QsWlmKWKt~wtP4m"; // Your secret key
$issuer = "http://localhost";
$audience = "http://localhost";
$issued_at = time();
$not_before = $issued_at;
$expiration_time = $issued_at + (60 * 60 * 5); // 5 minutes

// --- AUTOLOAD VENDOR LIBRARIES ---
// Make sure you have run 'composer install' or 'composer require firebase/php-jwt guzzlehttp/guzzle phpmailer/phpmailer' in the /api directory
require_once __DIR__ . '/../vendor/autoload.php';

// --- Include Helper Functions ---
require_once __DIR__ . '/../includes/functions.php'; // <-- THIS LINE WAS MISSING

?>