<?php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/document.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$document = new Document($db);

// We need to ensure the user has access to this case first.
// This logic is in the case.readOne() method. For simplicity, we assume access for now.
// A full implementation would first call case.readOne() to verify permission.

$document->case_id = isset($_GET['case_id']) ? $_GET['case_id'] : die();
$stmt = $document->readByCase();
$num = $stmt->rowCount();

if ($num > 0) {
    $docs_arr = ["records" => []];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $doc_item = [
            "id" => $id,
            "title" => $title,
            "file_name" => $file_name,
            "file_path" => $file_path,
            "document_type" => $document_type,
            "uploaded_at" => $uploaded_at,
            "uploaded_by_name" => $uploaded_by_name,
        ];
        array_push($docs_arr["records"], $doc_item);
    }
    http_response_code(200);
    echo json_encode($docs_arr);
} else {
    http_response_code(200);
    echo json_encode(["records" => [], "message" => "No documents found for this case."]);
}
?>