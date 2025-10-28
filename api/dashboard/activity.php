<?php
// /api/dashboard/activity.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/validate_token.php'; // Secure this endpoint

$database = new Database();
$db = $database->getConnection();

$requesting_user_id = $decoded->data->id;
$requesting_role = $decoded->data->role;
$limit = isset($_GET['limit']) ? min(max(1, (int)$_GET['limit']), 50) : 10; // Limit between 1-50, default 10

try {
    // Fetch recent activities, joining with users table
    // TODO: Add role-based filtering if needed
    $query = "SELECT a.id, a.action_type, a.description, a.timestamp, u.first_name, u.last_name
              FROM activity_log a
              LEFT JOIN users u ON a.user_id = u.id
              ORDER BY a.timestamp DESC
              LIMIT :limit";

    $stmt = $db->prepare($query);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $activities = [];

    foreach ($results as $row) {
        $activities[] = [
            'id' => $row['id'],
            'user_name' => trim($row['first_name'] . ' ' . $row['last_name']) ?: 'System/Deleted User',
            'action' => $row['description'],
            'time' => $row['timestamp'] // Send raw timestamp
        ];
    }
    http_response_code(200);
    echo json_encode(['records' => $activities]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching activity log.",
        "error" => $e->getMessage()
    ]);
}
?>