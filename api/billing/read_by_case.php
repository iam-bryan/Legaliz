<?php
require_once __DIR__ . '/../config/core.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../objects/billing.php';
require_once __DIR__ . '/../auth/validate_token.php';

$database = new Database();
$db = $database->getConnection();
$billing = new Billing($db);

// Permission to view billing is tied to permission to view the case.
// A full implementation should verify case access first.

$billing->case_id = isset($_GET['case_id']) ? $_GET['case_id'] : die();
$stmt = $billing->readByCase();
$num = $stmt->rowCount();

if ($num > 0) {
    $billings_arr = ["records" => []];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $billing_item = [
            "id" => $id,
            "invoice_number" => $invoice_number,
            "amount" => $amount,
            "description" => $description,
            "due_date" => $due_date,
            "status" => $status,
            "created_at" => $created_at
        ];
        array_push($billings_arr["records"], $billing_item);
    }
    http_response_code(200);
    echo json_encode($billings_arr);
} else {
    http_response_code(200);
    echo json_encode(["records" => [], "message" => "No billing records found for this case."]);
}
?>