<?php
// /api/cases/read_by_client.php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/case.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$case = new CaseItem($db);

$user_id = $decoded->data->id;
$role = $decoded->data->role;

// Get the client_id from the URL
$client_id = isset($_GET['client_id']) ? intval($_GET['client_id']) : 0;
if ($client_id <= 0) {
    http_response_code(400);
    echo json_encode(["message" => "A valid client_id is required."]);
    exit();
}

// --- Permission Check ---
// We must ensure the user is allowed to see this client's cases.
// 1. Admin/Partner/Lawyer/Staff can see any client's cases.
// 2. A 'client' can ONLY see their own cases.
$is_authorized = false;
if (in_array($role, ['admin', 'partner', 'lawyer', 'staff'])) {
    $is_authorized = true;
} elseif ($role === 'client') {
    // Check if the client_id they are requesting matches their own user_id link
    $client_check_stmt = $db->prepare("SELECT id FROM clients WHERE id = :client_id AND user_id = :user_id");
    $client_check_stmt->bindParam(':client_id', $client_id);
    $client_check_stmt->bindParam(':user_id', $user_id);
    $client_check_stmt->execute();
    if ($client_check_stmt->rowCount() > 0) {
        $is_authorized = true;
    }
}

if (!$is_authorized) {
    http_response_code(403);
    echo json_encode(["message" => "Access Denied."]);
    exit();
}

// --- Fetch Cases ---
try {
    // This query is simpler: just find cases for this client
    // We still join to get lawyer/type names
    $query = "SELECT
                c.id, c.title, c.status, c.progress,
                CONCAT(u.first_name, ' ', u.last_name) as lawyer_name,
                ct.name as case_type_name
              FROM cases c
              LEFT JOIN users u ON c.lawyer_id = u.id
              LEFT JOIN case_types ct ON c.case_type_id = ct.id
              WHERE c.client_id = :client_id
              ORDER BY c.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':client_id', $client_id);
    $stmt->execute();

    $num = $stmt->rowCount();
    $cases_arr = ["records" => []];

    if ($num > 0) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            $case_item = [
                "id" => $id,
                "title" => $title,
                "status" => $status,
                "progress" => $progress,
                "lawyer_name" => $lawyer_name ?? 'Unassigned', // Handle null lawyer
                "case_type_name" => $case_type_name
            ];
            array_push($cases_arr["records"], $case_item);
        }
    }
    
    http_response_code(200);
    echo json_encode($cases_arr);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Error fetching cases.", "error" => $e->getMessage()]);
}
?>