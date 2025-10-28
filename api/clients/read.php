<?php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/client.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$client = new Client($db);

// Get the user's role AND ID from the decoded token
$user_role = $decoded->data->role;
$user_id = $decoded->data->id; // <-- ADD THIS LINE

// Pass both role and ID to the read method
$stmt = $client->read($user_role, $user_id); // <-- UPDATED THIS LINE

if (!$stmt) {
    http_response_code(403);
    echo json_encode(["message" => "Access Denied."]);
    exit();
}

$num = $stmt->rowCount();
if ($num > 0) {
    $clients_arr = ["records" => []];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $client_item = [
            "id" => $id,
            "name" => $name,
            "email" => $email,
            "contact" => $contact,
            "address" => $address
            // "created_at" is available in $row if needed
        ];
        array_push($clients_arr["records"], $client_item);
    }
    http_response_code(200);
    echo json_encode($clients_arr);
} else {
    http_response_code(200);
    echo json_encode(["records" => [], "message" => "No clients found."]);
}
?>