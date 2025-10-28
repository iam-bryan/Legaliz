<?php
// /api/includes/functions.php

// Import PHPMailer classes into the global namespace
// These must be at the top of the file
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP; 

/**
 * Sends an email using PHPMailer.
 *
 * @param string $to_email Recipient's email address.
 * @param string $to_name Recipient's name.
 * @param string $subject The subject of the email.
 * @param string $body The HTML body of the email.
 * @return bool True on success, false on failure.
 */
function sendEmail($to_email, $to_name, $subject, $body) {
    // Use the $mail variable, as defined in the original code.
    $mail = new PHPMailer(true); // Enable exceptions

    try {
        // --- Server Settings ---
        
        // SMTP Debug is no longer needed, Mailtrap is our debugger.
        $mail->SMTPDebug = SMTP::DEBUG_OFF; // Set to 0

        // --- UPDATED FOR MAILTRAP ---
        // Apply settings directly to the $mail object
        $mail->isSMTP();
        $mail->Host       = 'sandbox.smtp.mailtrap.io';
        $mail->SMTPAuth   = true;
        $mail->Port       = 2525;
        $mail->Username   = '71f74e04ee112d'; // Your Mailtrap Username
        $mail->Password   = '7bcb976ae28d8c'; // Your Mailtrap Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
        // --- END MAILTRAP SETTINGS ---

        // --- Recipients ---
        // This is the "From" name and email the user will see.
        // Mailtrap will overwrite this, but it's good practice.
        $mail->setFrom('noreply@legaliz-app.com', 'Legaliz Support'); 
        
        // This is the user you are sending TO (which is a variable)
        $mail->addAddress($to_email, $to_name);

        // --- Content ---
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;
        // Optional: Add a plain-text version for non-HTML email clients
        $mail->AltBody = strip_tags($body); 

        $mail->send();
        return true; // Email sent successfully

    } catch (Exception $e) {
        // Log the detailed PHPMailer error message
        error_log("PHPMailer Error: " . $mail->ErrorInfo);
        return false; // Email sending failed
    }
}


/**
 * Logs an activity to the activity_log table.
 *
 * @param PDO $db Database connection object.
 * @param int|null $user_id ID of the user performing the action (can be null for system actions).
 * @param string $action_type A short code for the action (e.g., 'CASE_CREATED').
 * @param string $description A human-readable description of the action.
 * @param string|null $entity_type Optional type of related entity (e.g., 'case', 'document').
 * @param int|null $entity_id Optional ID of the related entity.
 */
function logActivity($db, $user_id, $action_type, $description, $entity_type = null, $entity_id = null) {
    // Basic validation
    if (empty($db) || empty($action_type) || empty($description)) {
        error_log("logActivity failed: Missing required parameters.");
        return;
    }

    try {
        $sql = "INSERT INTO activity_log (user_id, action_type, description, related_entity_type, related_entity_id)
                VALUES (:user_id, :action_type, :description, :entity_type, :entity_id)";
        $stmt = $db->prepare($sql);

        // Bind parameters carefully, handling potential nulls and types
        $stmt->bindParam(':user_id', $user_id, $user_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindParam(':action_type', $action_type, PDO::PARAM_STR);
        $stmt->bindParam(':description', $description, PDO::PARAM_STR);
        $stmt->bindParam(':entity_type', $entity_type, $entity_type === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(':entity_id', $entity_id, $entity_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);

        $stmt->execute();
    } catch (PDOException $e) {
        // Log the error but don't stop the main script execution
        error_log("Failed to log activity: UserID={$user_id}, Action={$action_type}, Error: " . $e->getMessage());
    } catch (Exception $e) {
        error_log("General error in logActivity: " . $e->getMessage());
    }
}
?>