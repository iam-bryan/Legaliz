<?php
// /api/auth/request-password-reset.php

ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../config/core.php'; 
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/user.php'; 

$database = new Database();
$db = $database->getConnection();
$user = new User($db);

$data = json_decode(file_get_contents("php://input"));

// --- NEW DEBUG ---
error_log("--- PASSWORD RESET DEBUG: Script started. ---");

// --- Validation ---
if (empty($data->email) || !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    // --- NEW DEBUG ---
    error_log("PASSWORD RESET DEBUG: Validation FAILED. Email empty or invalid.");
    http_response_code(400);
    echo json_encode(["message" => "A valid email address is required."]);
    exit();
}

// --- NEW DEBUG ---
error_log("PASSWORD RESET DEBUG: Email from input: " . $data->email);

$user->email = $data->email;
$email_exists = $user->emailExists(); 

if (!$email_exists) {
    // --- NEW DEBUG ---
    error_log("PASSWORD RESET DEBUG: Email check FAILED. User '" . $data->email . "' not found in database. Silently exiting.");
    
    // Email doesn't exist. Pretend to be successful.
    http_response_code(200);
    echo json_encode(["message" => "If an account with that email exists, a password reset link has been sent."]);
    exit();
}

try {
    // --- NEW DEBUG ---
    error_log("PASSWORD RESET DEBUG: Email check SUCCESS. Found user ID: " . $user->id . ". Proceeding...");

    // --- Generate Secure Token ---
    $token = bin2hex(random_bytes(32)); // 64-character hex string
    $expires_at = date('Y-m-d H:i:s', time() + 3600); // Token expires in 1 hour
    $email = $user->email;

    // --- Delete old tokens for this user ---
    $delete_sql = "DELETE FROM password_resets WHERE email = :email";
    $delete_stmt = $db->prepare($delete_sql);
    $delete_stmt->bindParam(':email', $email);
    $delete_stmt->execute();
    
    // --- NEW DEBUG ---
    error_log("PASSWORD RESET DEBUG: Old tokens deleted.");

    // --- Store New Token in Database ---
    $insert_sql = "INSERT INTO password_resets (email, token, expires_at) VALUES (:email, :token, :expires_at)";
    $insert_stmt = $db->prepare($insert_sql);
    $insert_stmt->bindParam(':email', $email);
    $insert_stmt->bindParam(':token', $token);
    $insert_stmt->bindParam(':expires_at', $expires_at);

    if (!$insert_stmt->execute()) {
        throw new Exception("Database error: Could not store reset token.");
    }

    // --- NEW DEBUG ---
    error_log("PASSWORD RESET DEBUG: New token stored in DB. Preparing to send email...");

    // --- Send the Email ---
    $reset_link = "http://localhost:3000/reset-password/" . $token;
    $subject = "Password Reset Request for Legaliz";
    $body = "
        <p>Hello,</p>
        <p>Someone (hopefully you) requested a password reset for your Legaliz account.</p>
        <p>If this was you, please click the link below to reset your password. The link will expire in 1 hour.</p>
        <p><a href='{$reset_link}' style='padding: 10px 15px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;'>Click here to reset your password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thanks,<br>The Legaliz Team</p>
    ";

    // Call the function from your functions.php file
    $email_sent = sendEmail($email, $user->first_name, $subject, $body);

    // --- NEW DEBUG ---
    error_log("PASSWORD RESET DEBUG: sendEmail() function returned: " . ($email_sent ? 'true' : 'false'));

    if (!$email_sent) {
         throw new Exception("Email error: sendEmail() function returned false. Check PHPMailer settings in functions.php and Mailtrap credentials.");
    }
    
    logActivity($db, $user->id, 'PASSWORD_RESET_REQUEST', "User requested password reset.", 'user', $user->id);

    // --- Send Generic Success Response ---
    http_response_code(200);
    echo json_encode(["message" => "If an account with that email exists, a password reset link has been sent."]);

} catch (Exception $e) {
    // --- NEW DEBUG ---
    error_log("PASSWORD RESET DEBUG: An exception was caught: " . $e->getMessage() . " on line " . $e->getLine());
    
    http_response_code(500); 
    echo json_encode(["message" => "An internal server error occurred. Please try again later."]);
}
?>

