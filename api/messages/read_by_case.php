<?php
// /api/messages/read_by_case.php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/message.php';
require_once __DIR__ . '/../auth/validate_token.php'; // Secure it

$database = new Database();
$db = $database->getConnection();
$message = new Message($db);

$user_id = $decoded->data->id;
$role = $decoded->data->role;

// Get case_id from URL
$message->case_id = isset($_GET['case_id']) ? intval($_GET['case_id']) : 0;
if ($message->case_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "Valid case_id is required."]);
    exit();
}

// TODO: You should add a permission check here to ensure
// the $user_id is the client or lawyer on this case,
// or is an admin/partner.

try {
    $stmt = $message->readByCase();
    $num = $stmt->rowCount();
    $messages_arr = ["records" => []];

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $message_item = [
                "id" => $id,
                "case_id" => $case_id,
                "sender_id" => $sender_id,
                "message" => $message,
                "sent_at" => $sent_at,
                "sender_name" => $sender_name,
                "sender_role" => $sender_role
            ];
            array_push($messages_arr["records"], $message_item);
        }
    }
    http_response_code(200);
    echo json_encode($messages_arr);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching messages.", "error" => $e->getMessage()]);
}
?>