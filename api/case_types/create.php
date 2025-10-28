<?php
// /api/case_types/create.php
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
    echo json_encode(["message" => "Access Denied. Only admins or partners can create case types."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"));

// --- Data Validation ---
if (empty($data->name)) {
    http_response_code(400);
    echo json_encode(["message" => "Case type name is required."]);
    exit();
}

try {
    $query = "INSERT INTO case_types SET name = :name, description = :description";
    $stmt = $db->prepare($query);

    $name = htmlspecialchars(strip_tags($data->name));
    $description = isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : null;

    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':description', $description);

    if ($stmt->execute()) {
        $new_id = $db->lastInsertId();
        // Log activity
        logActivity($db, $requesting_user_id, 'CASE_TYPE_CREATED', "Created case type: '" . $name . "'", 'case_type', $new_id);

        http_response_code(201);
        echo json_encode(["message" => "Case type created.", "id" => $new_id]);
    } else {
        // Check for duplicate name error (UNIQUE constraint)
        if ($stmt->errorInfo()[1] == 1062) { // 1062 is MySQL duplicate entry code
             http_response_code(409); // Conflict
             echo json_encode(["message" => "Failed to create case type. Name already exists."]);
        } else {
             http_response_code(503);
             echo json_encode(["message" => "Failed to create case type in database."]);
        }
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Server error creating case type.",
        "error" => $e->getMessage()
    ]);
}
?>