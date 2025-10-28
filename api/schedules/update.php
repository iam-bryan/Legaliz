<?php // /api/schedules/update.php
require_once __DIR__ . '/../config/core.php'; require_once __DIR__ . '/../config/database.php'; require_once __DIR__ . '/../objects/schedule.php'; require_once __DIR__ . '/../auth/validate_token.php';
$database = new Database(); $db = $database->getConnection(); $schedule = new Schedule($db);
$user_id = $decoded->data->id; $data = json_decode(file_get_contents("php://input"));
if (empty($data->id) || empty($data->event_title) || empty($data->start_date)) { http_response_code(400); echo json_encode(["message" => "Incomplete data."]); exit(); }
$schedule->id = $data->id; $schedule->event_title = $data->event_title; $schedule->start_date = $data->start_date; $schedule->end_date = $data->end_date ?? null; $schedule->location = $data->location ?? ''; $schedule->notes = $data->notes ?? ''; $schedule->status = $data->status ?? 'pending';
// TODO: Add permission check
if ($schedule->update()) {
    // --- UPDATED LOGGING (No ID in description) ---
    logActivity($db, $user_id, 'SCHEDULE_UPDATED', "Updated schedule event: '" . htmlspecialchars($schedule->event_title) . "'", 'schedule', $schedule->id);
    // --- END LOGGING ---
    http_response_code(200); echo json_encode(["message" => "Schedule event updated."]);
} else { http_response_code(503); echo json_encode(["message" => "Failed update event."]); }
?>