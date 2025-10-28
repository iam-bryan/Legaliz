<?php // /api/users/delete.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/user.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $user = new User($db);
$requesting_user_id = $decoded->data->id; $requesting_role = $decoded->data->role; $data = json_decode(file_get_contents("php://input"));
if (!empty($data->id)) {
    $user->id = $data->id;
    if ($user->delete($requesting_role)) {
        // --- LOGGING (No change needed) ---
        logActivity($db, $requesting_user_id, 'USER_DELETED', "Deleted user ID: {$user->id}", 'user', $user->id);
        // --- END LOGGING ---
        http_response_code(200); echo json_encode(["message" => "User deleted."]);
    } else { http_response_code(403); echo json_encode(["message" => "Delete failed. Permission denied or user not found."]); }
} else { http_response_code(400); echo json_encode(["message" => "User ID required."]); }
?>