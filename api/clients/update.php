<?php // /api/clients/update.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/client.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $client = new Client($db);
$user_id = $decoded->data->id; $data = json_decode(file_get_contents("php://input"));
if (!empty($data->id) && !empty($data->name) && !empty($data->email)) { $client->id = $data->id; $client->name = $data->name; $client->email = $data->email; $client->contact = $data->contact ?? null; $client->address = $data->address ?? null;
    if ($client->update()) {
        // --- UPDATED LOGGING (No ID in description) ---
        logActivity($db, $user_id, 'CLIENT_UPDATED', "Updated client profile: '" . htmlspecialchars($client->name) . "'", 'client', $client->id);
        // --- END LOGGING ---
        http_response_code(200); echo json_encode(["message" => "Client updated."]);
    } else { http_response_code(503); echo json_encode(["message" => "Failed update client."]); }
} else { http_response_code(400); echo json_encode(["message" => "Incomplete data. ID, Name, Email required."]); }
?>