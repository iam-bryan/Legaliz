<?php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/schedule.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$schedule = new Schedule($db);

$user_id = $decoded->data->id;
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->case_id) && !empty($data->event_title) && !empty($data->start_date)) {
    $schedule->case_id = $data->case_id;
    $schedule->scheduled_by = $user_id;
    $schedule->event_title = $data->event_title;
    $schedule->start_date = $data->start_date;
    $schedule->end_date = $data->end_date ?? null;
    $schedule->location = $data->location ?? '';
    $schedule->notes = $data->notes ?? '';

    if ($schedule->create()) {
        http_response_code(201);
        echo json_encode(["message" => "Schedule event was created."]);
    } else {
        http_response_code(503);
        echo json_encode(["message" => "Unable to create event."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["message" => "Unable to create event. Data is incomplete."]);
}
?>