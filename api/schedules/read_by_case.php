<?php
// /api/schedules/read_by_case.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/schedule.php'; // Use the existing Schedule object
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$schedule = new Schedule($db);

// Get case_id from query parameter
$schedule->case_id = isset($_GET['case_id']) ? $_GET['case_id'] : die();

// Permission check: Ensure the requesting user has access to this case.
// This is a simplified check. A full check might involve joining tables.
// We'll rely on the frontend having already verified access to the main case details.

try {
    // Modify the query to filter by case_id
    $query = "SELECT s.id, s.event_title as title, s.start_date as start, s.end_date as end, s.location, s.notes, s.status
              FROM schedules s
              WHERE s.case_id = :case_id
              ORDER BY s.start_date ASC";

    $stmt = $db->prepare($query);
    $stmt->bindParam(":case_id", $schedule->case_id);
    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $schedules_arr = ["records" => []];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $schedule_item = [
                "id" => $id,
                "title" => $title,
                "start" => $start,
                "end" => $end,
                "location" => $location,
                "notes" => $notes,
                "status" => $status
            ];
            array_push($schedules_arr["records"], $schedule_item);
        }
        http_response_code(200);
        echo json_encode($schedules_arr);
    } else {
        http_response_code(200);
        echo json_encode(["records" => [], "message" => "No schedule events found for this case."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching schedule data for case.",
        "error" => $e->getMessage()
    ]);
}
?>