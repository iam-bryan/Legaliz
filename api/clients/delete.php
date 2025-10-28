<?php // /api/clients/delete.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/client.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $client = new Client($db);
$user_id = $decoded->data->id; $data = json_decode(file_get_contents("php://input"));
if (!empty($data->id)) {
    $client->id = $data->id;
    if ($client->delete()) {
        // --- LOGGING (No change needed) ---
        logActivity($db, $user_id, 'CLIENT_DELETED', "Deleted client ID: {$client->id}", 'client', $client->id);
        // --- END LOGGING ---
        http_response_code(200); echo json_encode(["message" => "Client deleted."]);
    } else { http_response_code(503); echo json_encode(["message" => "Failed delete client."]); }
} else { http_response_code(400); echo json_encode(["message" => "Client ID required."]); }
?>