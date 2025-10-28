<?php
// /api/users/create.php

// Required headers and configuration
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/user.php';
require_once __DIR__ . '/../objects/client.php'; // Needed if creating a client user

// Validate the JWT to secure the endpoint
require_once __DIR__ . '/../auth/validate_token.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate user object
$user = new User($db);

// Get the role of the user making the request from the decoded token
$requesting_role = $decoded->data->role;

// --- Permission Check ---
if (!in_array($requesting_role, ['admin', 'partner'])) {
    http_response_code(403); // Forbidden
    echo json_encode(["message" => "Access Denied. You do not have permission to create users."]);
    exit();
}

// Get the data from the request body
$data = json_decode(file_get_contents("php://input"));

// --- DATA VALIDATION ---
if (
    !empty($data->first_name) &&
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->role) &&
    filter_var($data->email, FILTER_VALIDATE_EMAIL) &&
    in_array($data->role, ['admin', 'lawyer', 'staff', 'client', 'partner']) // Validate role
) {
    // Check if email already exists
    $user->email = $data->email;
    if ($user->emailExists()) {
        http_response_code(409); // Conflict
        echo json_encode(["message" => "Unable to create user. Email already exists."]);
        exit();
    }

    // Set user property values
    $user->first_name = $data->first_name;
    $user->last_name = $data->last_name ?? ''; // Last name can be optional
    $user->password = $data->password;
    $user->role = $data->role;

    // Use a transaction for creating user and potentially client profile
    $db->beginTransaction();
    try {
        // Attempt to create the user
        if ($user->create()) {
            // If the role is 'client', also create a corresponding client profile
            if ($user->role === 'client') {
                $client = new Client($db);
                $client->user_id = $user->id;
                $client->name = $user->first_name . ' ' . $user->last_name;
                $client->email = $user->email;
                // Add contact/address if provided in $data
                $client->contact = $data->contact ?? null;
                $client->address = $data->address ?? null;

                if (!$client->create()) {
                    throw new Exception("User created, but failed to create associated client profile.");
                }
            }
            // If everything succeeded, commit the transaction
            $db->commit();
            http_response_code(201); // Created
            echo json_encode(["message" => "User was created successfully.", "user_id" => $user->id]);

        } else {
            throw new Exception("Unable to create user in the database.");
        }
    } catch (Exception $e) {
        // If anything fails, roll back the transaction
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        http_response_code(503); // Service Unavailable
        echo json_encode([
            "message" => "Unable to create user.",
            "error" => $e->getMessage()
        ]);
    }

} else {
    // Data is incomplete or invalid
    http_response_code(400); // Bad Request
    echo json_encode(["message" => "Unable to create user. Data is incomplete or invalid (check email format, password length, and role)."]);
}
?>