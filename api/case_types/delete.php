<?php
// /api/case_types/delete.php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/validate_token.php'; // Secure this endpoint

$database = new Database();
$db = $database->getConnection();

// --- Permission Check ---
$requesting_user_id = $decoded->data->id;
$requesting_role = $decoded->data->role;
if (!in_array($requesting_role, ['admin', 'partner'])) {
    http_response_code(403);
    echo json_encode(["message" => "Access Denied. Only admins or partners can delete case types."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// --- Data Validation ---
if (empty($data->id)) {
    http_response_code(400);
    echo json_encode(["message" => "Case type ID is required."]);
    exit();
}

$id = htmlspecialchars(strip_tags($data->id));

// Note: Foreign key constraint on `cases` table might prevent deletion if cases use this type.
// (Depends if you used ON DELETE SET NULL or ON DELETE RESTRICT)
// You might want to check for associated cases before deleting.

try {
    $query = "DELETE FROM case_types WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
             // Log activity
            logActivity($db, $requesting_user_id, 'CASE_TYPE_DELETED', "Deleted case type ID: " . $id, 'case_type', $id);
            http_response_code(200);
            echo json_encode(["message" => "Case type deleted."]);
        } else {
            http_response_code(404); // Not Found
            echo json_encode(["message" => "Case type not found."]);
        }
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Failed to delete case type. Check if it's in use by cases."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Server error deleting case type.",
        "error" => $e->getMessage()
    ]);
}
?>