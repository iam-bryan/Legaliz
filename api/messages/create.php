<?php
// /api/messages/create.php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/message.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$message = new Message($db);

$user_id = $decoded->data->id; // The sender is the logged-in user
$role = $decoded->data->role;
$data = json_decode(file_get_contents("php://input"));

if (empty($data->case_id) || empty($data->message)) {
    http_response_code(400);
    echo json_encode(["message" => "Incomplete data. Case ID and message text are required."]);
    exit();
}

// TODO: Add a permission check here (like in read_by_case.php)

$message->case_id = $data->case_id;
$message->sender_id = $user_id; // Set sender as current user
$message->message = $data->message;

try {
    if ($message->create()) {
        logActivity($db, $user_id, 'CASE_NOTE_ADDED', "Added note to case #" . $message->case_id, 'case', $message->case_id);
        http_response_code(201);
        echo json_encode(["message" => "Note added.", "id" => $message->id]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to add note."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Server error adding note.", "error" => $e->getMessage()]);
}
?>