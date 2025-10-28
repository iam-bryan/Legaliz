<?php
// /api/dashboard/workload.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/validate_token.php'; // Secure this endpoint

$database = new Database();
$db = $database->getConnection();

// --- Query to get case creation counts for the last 30 days ---
try {
    // This query groups cases by the date they were created
    // and counts them for each day in the last 30 days.
    $query = "SELECT DATE(created_at) as date, COUNT(*) as count
              FROM cases
              WHERE created_at >= CURDATE() - INTERVAL 30 DAY
              GROUP BY DATE(created_at)
              ORDER BY date ASC";

    $stmt = $db->prepare($query);
    $stmt->execute();

    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // --- Prepare data for Chart.js ---
    // Create an array of the last 30 dates
    $labels = [];
    $data_counts = [];
    $date_map = []; // Helper to map results to dates

    // Populate map with actual counts
    foreach ($results as $row) {
        $date_map[$row['date']] = $row['count'];
    }

    // Generate labels and data for the last 30 days, filling in 0 for days with no cases
    for ($i = 29; $i >= 0; $i--) {
        $date = date('Y-m-d', strtotime("-$i days"));
        $labels[] = $date;
        $data_counts[] = isset($date_map[$date]) ? (int)$date_map[$date] : 0;
    }

    http_response_code(200);
    echo json_encode([
        'labels' => $labels,
        'data' => $data_counts
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching workload data.",
        "error" => $e->getMessage()
    ]);
}
?>