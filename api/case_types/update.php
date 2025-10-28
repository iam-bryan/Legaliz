<?php
// /api/case_types/update.php
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
    echo json_encode(["message" => "Access Denied. Only admins or partners can update case types."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// --- Data Validation ---
if (empty($data->id) || empty($data->name)) {
    http_response_code(400);
    echo json_encode(["message" => "Case type ID and name are required."]);
    exit();
}

try {
    $query = "UPDATE case_types SET name = :name, description = :description WHERE id = :id";
    $stmt = $db->prepare($query);

    $id = htmlspecialchars(strip_tags($data->id));
    $name = htmlspecialchars(strip_tags($data->name));
    $description = isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;

    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);

    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            // Log activity
            logActivity($db, $requesting_user_id, 'CASE_TYPE_UPDATED', "Updated case type ID: " . $id, 'case_type', $id);
            http_response_code(200);
            echo json_encode(["message" => "Case type updated."]);
        } else {
            http_response_code(200); // OK, but no change detected or ID not found
            echo json_encode(["message" => "Update processed, but no changes detected or case type not found."]);
        }
    } else {
         // Check for duplicate name error (UNIQUE constraint)
        if ($stmt->errorInfo()[1] == 1062) { // 1062 is MySQL duplicate entry code
             http_response_code(409); // Conflict
             echo json_encode(["message" => "Failed to update case type. Name already exists for another type."]);
        } else {
             http_response_code(503);
             echo json_encode(["message" => "Failed to update case type in database."]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Server error updating case type.",
        "error" => $e->getMessage()
    ]);
}
?>