<?php
// /api/cases/activity.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/validate_token.php'; // Secure this endpoint

$database = new Database();
$db = $database->getConnection();

$requesting_user_id = $decoded->data->id;
$requesting_role = $decoded->data->role;

// Get case_id from query parameter
$case_id = isset($_GET['case_id']) ? (int)$_GET['case_id'] : 0;
$limit = isset($_GET['limit']) ? min(max(1, (int)$_GET['limit']), 50) : 20; // Default 20, max 50

if (!$case_id) {
    http_response_code(400);
    echo json_encode(["message" => "Case ID is required."]);
    exit;
}

try {
    // Fetch activities related to this case
    $query = "SELECT a.id, a.action_type, a.description, a.timestamp, u.first_name, u.last_name
              FROM activity_log a
              LEFT JOIN users u ON a.user_id = u.id
              WHERE a.related_entity_type = 'case' AND a.related_entity_id = :case_id
              ORDER BY a.timestamp DESC
              LIMIT :limit";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':case_id', $case_id, PDO::PARAM_INT);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = [];

    foreach ($results as $row) {
        $activities[] = [
            'id' => $row['id'],
            'user_name' => trim($row['first_name'] . ' ' . $row['last_name']) ?: 'System',
            'action_type' => $row['action_type'],
            'description' => $row['description'],
            'timestamp' => $row['timestamp']
        ];
    }
    
    http_response_code(200);
    echo json_encode(['records' => $activities]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching case activity log.",
        "error" => $e->getMessage()
    ]);
}
?>
