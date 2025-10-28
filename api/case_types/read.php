<?php
// /api/case_types/read.php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
// No need for validate_token.php if reading types is public/allowed for all logged-in users
// require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();

try {
    $query = "SELECT id, name, description FROM case_types ORDER BY name ASC";
    $stmt = $db->prepare($query);
    $stmt->execute();

    $num = $stmt->rowCount();

    if ($num > 0) {
        $types_arr = ["records" => []];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $type_item = [
                "id" => $id,
                "name" => $name,
                "description" => $description
            ];
            array_push($types_arr["records"], $type_item);
        }
        http_response_code(200);
        echo json_encode($types_arr);
    } else {
        http_response_code(200); // OK, but empty list
        echo json_encode(["records" => [], "message" => "No case types found."]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "message" => "Error fetching case types.",
        "error" => $e->getMessage()
    ]);
}
?>