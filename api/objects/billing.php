<?php
// /api/objects/billing.php

class Billing {
    private $conn;
    private $table_name = "billings";

    // Object Properties
    public $id;
    public $invoice_number;
    public $case_id;
    public $amount;
    public $description;
    public $due_date;
    public $status;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Reads all billing records for a specific case.
     */
    public function readByCase() {
        // A user's access to a case's billing info is predicated on their access to the case itself.
        // The permission check should happen in the endpoint before calling this method.
        $query = "SELECT id, invoice_number, amount, description, due_date, status, created_at
                  FROM " . $this->table_name . "
                  WHERE case_id = ?
                  ORDER BY created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->case_id);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Creates a new billing record.
     */
    public function create($role): bool {
        // Permission check: Only certain roles can create invoices.
        if (!in_array($role, ['admin', 'partner', 'lawyer', 'staff'])) {
            return false;
        }

        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    invoice_number = :invoice_number,
                    case_id = :case_id,
                    amount = :amount,
                    description = :description,
                    due_date = :due_date,
                    status = :status";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->invoice_number = "INV-" . date("Y") . "-" . rand(1000, 9999); // Generate a simple invoice number
        $this->case_id = htmlspecialchars(strip_tags($this->case_id));
        $this->amount = htmlspecialchars(strip_tags($this->amount));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->due_date = !empty($this->due_date) ? htmlspecialchars(strip_tags($this->due_date)) : null;
        $this->status = 'unpaid'; // Default status

        $stmt->bindParam(":invoice_number", $this->invoice_number);
        $stmt->bindParam(":case_id", $this->case_id);
        $stmt->bindParam(":amount", $this->amount);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":due_date", $this->due_date);
        $stmt->bindParam(":status", $this->status);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    /**
     * Updates the status of an existing billing record.
     */
    public function updateStatus($role): bool {
        if (!in_array($role, ['admin', 'partner', 'staff'])) {
            return false; // Only specific roles can update payment status
        }

        $query = "UPDATE " . $this->table_name . " SET status = :status WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    /**
     * Deletes a billing record.
     */
    public function delete($role): bool {
        if (!in_array($role, ['admin', 'partner'])) {
            return false; // Only high-level roles can delete financial records
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>