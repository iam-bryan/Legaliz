<?php // /api/documents/delete.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/document.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $document = new Document($db);
$user_id = $decoded->data->id; $user_role = $decoded->data->role; $data = json_decode(file_get_contents("php://input"));
if (!empty($data->id)) {
    $document->id = $data->id;
    if ($document->delete($user_role)) {
        // --- LOGGING (No change needed) ---
        logActivity($db, $user_id, 'DOC_DELETED', "Deleted document ID: {$document->id}", 'document', $document->id);
        // --- END LOGGING ---
        http_response_code(200); echo json_encode(["message" => "Document was deleted."]);
    } else { http_response_code(403); echo json_encode(["message" => "Unable to delete document. Permission denied or not found."]); }
} else { http_response_code(400); echo json_encode(["message" => "Document ID is missing."]); }
?>