<?php
// /api/users/read_lawyers.php

require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/validate_token.php'; // Secure this endpoint

$database = new Database();
$db = $database->getConnection();

// --- UPDATED QUERY ---
// Fetch lawyers and aggregate their case type IDs into a comma-separated string
$query = "SELECT
            u.id, u.first_name, u.last_name,
            GROUP_CONCAT(ls.case_type_id) as specialization_ids
          FROM users u
          LEFT JOIN lawyer_specializations ls ON u.id = ls.user_id
          WHERE u.role IN ('lawyer', 'partner')
          GROUP BY u.id, u.first_name, u.last_name
          ORDER BY u.last_name ASC";
// --- END UPDATED QUERY ---

$stmt = $db->prepare($query);

try {
    $stmt->execute();
    $num = $stmt->rowCount();

    if ($num > 0) {
        $lawyers_arr = ["records" => []];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $lawyer_item = [
                "id" => $id,
                "name" => $first_name . ' ' . $last_name,
                // Convert comma-separated string to array of integers, handle null
                "specialization_ids" => $specialization_ids ? array_map('intval', explode(',', $specialization_ids)) : []
            ];
            array_push($lawyers_arr["records"], $lawyer_item);
        }
        http_response_code(200);
        echo json_encode($lawyers_arr);
    } else {
        http_response_code(200);
        echo json_encode(["records" => [], "message" => "No lawyers found."]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching lawyers.", "error" => $e->getMessage()]);
}
?>