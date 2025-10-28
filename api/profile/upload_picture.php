<?php
// /api/profile/upload_picture.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();

$user_id = $decoded->data->id;

// Check if file was uploaded
if (!isset($_FILES['profile_picture'])) {
    http_response_code(400);
    echo json_encode(["message" => "No file uploaded."]);
    exit();
}

// Directory for profile pictures
$upload_dir = "/uploads/profile_pictures/";
$target_dir = realpath(__DIR__ . '/../..') . $upload_dir;

// Create directory if it doesn't exist
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

$file = $_FILES["profile_picture"];
$file_type = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

// Validate file size (max 5MB)
if ($file["size"] > 5000000) {
    http_response_code(400);
    echo json_encode(["message" => "File too large. Maximum size is 5MB."]);
    exit();
}

// Validate file type (only images)
$allowed_types = ["jpg", "jpeg", "png", "gif"];
if (!in_array($file_type, $allowed_types)) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed."]);
    exit();
}

// Use user ID as filename (will overwrite old picture)
$target_file = $target_dir . $user_id . "." . $file_type;

// Delete any existing profile pictures for this user (different extensions)
foreach ($allowed_types as $ext) {
    $old_file = $target_dir . $user_id . "." . $ext;
    if (file_exists($old_file) && $old_file !== $target_file) {
        unlink($old_file);
    }
}

// Move uploaded file
if (move_uploaded_file($file["tmp_name"], $target_file)) {
    // Log activity
    $log_description = "Updated profile picture";
    logActivity($db, $user_id, 'PROFILE_PICTURE_UPDATED', $log_description, 'user', $user_id);
    
    http_response_code(200);
    echo json_encode([
        "message" => "Profile picture uploaded successfully.",
        "file_path" => $upload_dir . $user_id . "." . $file_type
    ]);
} else {
    http_response_code(503);
    echo json_encode(["message" => "Failed to upload profile picture."]);
}
?>