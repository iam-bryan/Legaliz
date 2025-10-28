<?php
// /api/profile/get_picture.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/validate_token.php';

$user_id = $decoded->data->id;

// Directory for profile pictures
$upload_dir = "/uploads/profile_pictures/";
$target_dir = realpath(__DIR__ . '/../..') . $upload_dir;

// Check for existing profile picture with any allowed extension
$allowed_types = ["jpg", "jpeg", "png", "gif"];
$profile_picture_path = null;

foreach ($allowed_types as $ext) {
    $file_path = $target_dir . $user_id . "." . $ext;
    if (file_exists($file_path)) {
        $profile_picture_path = $upload_dir . $user_id . "." . $ext;
        break;
    }
}

http_response_code(200);
echo json_encode([
    "has_picture" => $profile_picture_path !== null,
    "file_path" => $profile_picture_path
]);
?>
