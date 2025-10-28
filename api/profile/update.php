<?php // /api/profile/update.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/user.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $user = new User($db);
$user_id_from_token = $decoded->data->id; $data = json_decode(file_get_contents("php://input"));
if (empty($data->first_name) || empty($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) { http_response_code(400); echo json_encode(["message" => "First name and valid email required."]); exit(); }
$user->id = $user_id_from_token; $user->first_name = $data->first_name; $user->last_name = $data->last_name ?? ''; $user->email = $data->email;
try {
    if ($user->updateProfile()) {
        // --- LOGGING (No change needed) ---
        logActivity($db, $user_id_from_token, 'PROFILE_UPDATED', "User updated their own profile.", 'user', $user_id_from_token);
        // --- END LOGGING ---
        http_response_code(200); echo json_encode(["message" => "Profile updated."]);
    } else { if ($user->isEmailTakenByAnotherUser()) { http_response_code(409); echo json_encode(["message" => "Update failed. Email already in use."]); } else { http_response_code(200); echo json_encode(["message" => "Update processed, no changes detected."]); } }
} catch (Exception $e) { http_response_code(500); echo json_encode(["message" => "Server error updating profile.", "error" => $e->getMessage()]); }
?>