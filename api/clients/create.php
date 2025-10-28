<?php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/client.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$client = new Client($db);
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->name) && !empty($data->email)) {
    $client->name = $data->name;
    $client->email = $data->email;
    $client->contact = $data->contact ?? null;
    $client->address = $data->address ?? null;
    $client->user_id = $data->user_id ?? null; // Optional: link to a user account

    if ($client->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Client was created."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to create client."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to create client. Data is incomplete."]);
}
?>