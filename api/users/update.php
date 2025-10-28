<?php // /api/users/update.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/user.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $user = new User($db);
$requesting_user_id = $decoded->data->id; $requesting_role = $decoded->data->role; $data = json_decode(file_get_contents("php://input"));
if (empty($data->id) || empty($data->first_name) || empty($data->email) || empty($data->role) || !filter_var($data->email, FILTER_VALIDATE_EMAIL) || !in_array($data->role, ['admin', 'lawyer', 'staff', 'client', 'partner'])) { http_response_code(400); echo json_encode(["message" => "Incomplete or invalid data."]); exit(); }
$user->id = $data->id; $user->first_name = $data->first_name; $user->last_name = $data->last_name ?? ''; $user->email = $data->email; $user->role = $data->role;
if ($user->update($requesting_role)) {
    // --- UPDATED LOGGING (No target ID in description) ---
    $log_description = "Updated user profile for " . htmlspecialchars($user->email);
    logActivity($db, $requesting_user_id, 'USER_UPDATED', $log_description, 'user', $user->id);
    // --- END LOGGING ---
    http_response_code(200); echo json_encode(["message" => "User updated."]);
} else { if($user->isEmailTakenByAnotherUser()) { http_response_code(409); echo json_encode(["message" => "Update failed. Email already in use."]); } else { http_response_code(403); echo json_encode(["message" => "Update failed. Permission denied or user not found."]); } }
?>