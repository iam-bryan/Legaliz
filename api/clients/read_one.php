<?php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/client.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$client = new Client($db);

$client->id = isset($_GET['id']) ? $_GET['id'] : die();
$client->readOne();

if ($client->name != null) {
    $client_arr = [
        "id" => $client->id,
        "name" => $client->name,
        "email" => $client->email,
        "contact" => $client->contact,
        "address" => $client->address,
        "created_at" => $client->created_at
    ];
    http_response_code(200);
    echo json_encode($client_arr);
} else {
    http_response_code(404);
    echo json_encode(["message" => "Client not found."]);
}
?>