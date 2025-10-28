<?php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/schedule.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$schedule = new Schedule($db);

$user_id = $decoded->data->id;
$user_role = $decoded->data->role;

// Get date range from query parameters, required for calendar views
$start_range = isset($_GET['start']) ? $_GET['start'] : die();
$end_range = isset($_GET['end']) ? $_GET['end'] : die();

$stmt = $schedule->read($user_id, $user_role, $start_range, $end_range);
$num = $stmt->rowCount();

if ($num >= 0) { // Return empty array if no events
    $schedules_arr = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $schedule_item = [
            "id" => $id,
            "title" => $title, // <-- Main event title
            "start" => $start,
            "end" => $end,
            
            // --- FIX: Un-nest detailed properties here ---
            // These properties are now accessible directly by TodayScheduleCard.js
            "case_id" => $case_id,
            "case_title" => $case_title,
            "location" => $location,
            "notes" => $notes,
            "status" => $status,
            
            // Keep extendedProps for FullCalendar, but ensure they mirror the root fields.
            "extendedProps" => [
                "case_id" => $case_id,
                "case_title" => $case_title,
                "location" => $location,
                "notes" => $notes,
                "status" => $status
            ]
        ];
        array_push($schedules_arr, $schedule_item);
    }
    http_response_code(200);
    echo json_encode($schedules_arr); // The frontend calendar library expects a simple array
}
?>