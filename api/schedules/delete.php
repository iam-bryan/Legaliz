<?php // /api/schedules/delete.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/schedule.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $schedule = new Schedule($db);
$user_id = $decoded->data->id; $data = json_decode(file_get_contents("php://input"));
if (!empty($data->id)) {
    $schedule->id = $data->id;
    // TODO: Add permission check
    if ($schedule->delete()) {
        // --- LOGGING (No change needed) ---
        logActivity($db, $user_id, 'SCHEDULE_DELETED', "Deleted schedule event ID: {$schedule->id}", 'schedule', $schedule->id);
        // --- END LOGGING ---
        http_response_code(200); echo json_encode(["message" => "Schedule event deleted."]);
    } else { http_response_code(503); echo json_encode(["message" => "Failed delete event."]); }
} else { http_response_code(400); echo json_encode(["message" => "Event ID missing."]); }
?>