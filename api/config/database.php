<?php
// /api/config/database.php

class Database {
    // --- DATABASE CREDENTIALS FOR LOCAL DEVELOPMENT (XAMPP/WAMP) ---
    private $host = "localhost";
    private $db_name = "u785536991_legal_app_db"; // <-- THIS IS THE FIX
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            http_response_code(503);
            echo json_encode([
                "message" => "Database connection failed.",
                "error" => $exception->getMessage()
            ]);
            exit();
        }
        return $this->conn;
    }
}
?>