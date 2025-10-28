<?php
// /api/auth/reset_password.php

// Allow errors for debugging locally
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
// We don't need the full User object, just direct DB access

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

// Basic validation
if (
    empty($data->token) ||
    empty($data->password) ||
    strlen($data->password) < 8
) {
    http_response_code(400);
    echo json_encode(["message" => "Invalid input. Token and a password (min 8 characters) are required."]);
    exit();
}

$token = htmlspecialchars(strip_tags($data->token));
$new_password = $data->password;

try {
    // --- Find the token and verify it ---
    $find_sql = "SELECT email, expires_at FROM password_resets WHERE token = :token LIMIT 1";
    $find_stmt = $db->prepare($find_sql);
    $find_stmt->bindParam(':token', $token);
    $find_stmt->execute();

    $reset_request = $find_stmt->fetch(PDO::FETCH_ASSOC);

    if (!$reset_request) {
        http_response_code(400);
        echo json_encode(["message" => "Invalid or expired password reset token."]);
        exit();
    }

    // Check if token has expired
    $current_time = date('Y-m-d H:i:s');
    if ($reset_request['expires_at'] < $current_time) {
        // Optionally delete the expired token here
        $del_sql = "DELETE FROM password_resets WHERE token = :token";
        $del_stmt= $db->prepare($del_sql);
        $del_stmt->bindParam(':token', $token);
        $del_stmt->execute();

        http_response_code(400);
        echo json_encode(["message" => "Password reset token has expired. Please request a new one."]);
        exit();
    }

    $email = $reset_request['email'];

    // --- Update the user's password ---
    $hashed_password = password_hash($new_password, PASSWORD_BCRYPT);
    $update_sql = "UPDATE users SET password = :password WHERE email = :email";
    $update_stmt = $db->prepare($update_sql);
    $update_stmt->bindParam(':password', $hashed_password);
    $update_stmt->bindParam(':email', $email);

    if (!$update_stmt->execute()) {
        throw new Exception("Database error: Could not update user password.");
    }

    // --- Delete the used token ---
    $delete_sql = "DELETE FROM password_resets WHERE email = :email"; // Delete all tokens for this email
    $delete_stmt = $db->prepare($delete_sql);
    $delete_stmt->bindParam(':email', $email);
    $delete_stmt->execute();

    // --- Success ---
    http_response_code(200);
    echo json_encode(["message" => "Password has been successfully reset. You can now log in."]);

} catch (Exception $e) {
    error_log("Password Reset Error: " . $e->getMessage()); // Log the actual error
    http_response_code(500);
    echo json_encode(["message" => "An error occurred while resetting your password. Please try again later."]);
}
?>