<?php // /api/documents/upload.php
ini_set('display_errors', 1); error_reporting(E_ALL);
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/document.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $document = new Document($db); $user_id = $decoded->data->id;
if (!isset($_POST['case_id']) || !isset($_POST['title']) || !isset($_FILES['file'])) { http_response_code(400); echo json_encode(["message" => "Incomplete data."]); exit(); }
$upload_dir = "/uploads/documents/"; $target_dir = rtrim($_SERVER['DOCUMENT_ROOT'], '/') . $upload_dir;
if (!file_exists($target_dir)) { mkdir($target_dir, 0777, true); }
$file_name = basename($_FILES["file"]["name"]); $file_type = strtolower(pathinfo($file_name, PATHINFO_EXTENSION)); $unique_file_name = "doc_" . uniqid('', true) . "." . $file_type; $target_file = $target_dir . $unique_file_name;
if ($_FILES["file"]["size"] > 5000000) { http_response_code(400); echo json_encode(["message" => "File too large."]); exit(); }
$allowed_types = ["pdf", "doc", "docx", "jpg", "png", "jpeg", "txt"]; if (!in_array($file_type, $allowed_types)) { http_response_code(400); echo json_encode(["message" => "Invalid file type."]); exit(); }
if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
    $document->case_id = $_POST['case_id']; $document->title = $_POST['title']; $document->uploaded_by = $user_id; $document->file_name = $file_name; $document->file_path = $upload_dir . $unique_file_name; $document->document_type = $_POST['document_type'] ?? 'Uncategorized'; $document->tags = isset($_POST['tags']) ? explode(',', $_POST['tags']) : [];
    if ($document->create()) {
        // --- UPDATED LOGGING (No ID in description) ---
        $log_description = "Uploaded document '" . htmlspecialchars($document->title) . "' to case #" . $document->case_id;
        logActivity($db, $user_id, 'DOC_UPLOADED', $log_description, 'document', $document->id);
        // --- END LOGGING ---
        http_response_code(201); echo json_encode(["message" => "Document uploaded."]);
    } else { http_response_code(503); echo json_encode(["message" => "Failed save document record."]); }
} else { http_response_code(503); echo json_encode(["message" => "Failed upload file."]); }
?>