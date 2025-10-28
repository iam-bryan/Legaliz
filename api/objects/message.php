<?php
// /api/objects/message.php

class Message {
    private $conn;
    private $table_name = "messages";

    // Object Properties
    public $id;
    public $case_id;
    public $sender_id;
    public $message;
    public $sent_at;
    public $sender_name;
    public $sender_role;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Reads all messages for a specific case, joining user info.
     */
    public function readByCase() {
        // We join with 'users' to get the sender's name and role
        $query = "SELECT
                    m.id,
                    m.case_id,
                    m.sender_id,
                    m.message,
                    m.sent_at,
                    CONCAT(u.first_name, ' ', u.last_name) as sender_name,
                    u.role as sender_role
                  FROM
                    " . $this->table_name . " m
                  LEFT JOIN
                    users u ON m.sender_id = u.id
                  WHERE
                    m.case_id = :case_id
                  ORDER BY
                    m.sent_at ASC"; // Show oldest first, like a chat

        $stmt = $this->conn->prepare($query);
        $this->case_id = htmlspecialchars(strip_tags($this->case_id));
        $stmt->bindParam(':case_id', $this->case_id, PDO::PARAM_INT);

        $stmt->execute();
        return $stmt;
    }

    /**
     * Creates a new message (note) for a case.
     */
    public function create(): bool {
        // We only use case_id, sender_id, and message
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    case_id = :case_id,
                    sender_id = :sender_id,
                    message = :message";
        
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->case_id = htmlspecialchars(strip_tags($this->case_id));
        $this->sender_id = htmlspecialchars(strip_tags($this->sender_id));
        $this->message = strip_tags($this->message); // <-- REMOVED htmlspecialchars()

        // Bind
        $stmt->bindParam(":case_id", $this->case_id, PDO::PARAM_INT);
        $stmt->bindParam(":sender_id", $this->sender_id, PDO::PARAM_INT);
        $stmt->bindParam(":message", $this->message);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        error_log("Message Create Error: " . implode(":", $stmt->errorInfo()));
        return false;
    }
}
?>