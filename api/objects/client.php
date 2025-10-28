<?php
// /api/objects/client.php

class Client {
    private $conn;
    private $table_name = "clients";

    // Object Properties
    public $id;
    public $user_id;
    public $name;
    public $email;
    public $contact;
    public $address;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Read clients based on user role.
     * Admins/Partners see all.
     * Lawyers/Staff see only clients associated with their cases.
     */
    function read($role, $user_id) { // <-- UPDATED SIGNATURE
        // Base permission check (Clients can't see the list)
        if (!in_array($role, ['admin', 'partner', 'lawyer', 'staff'])) {
            return false; // Permission denied
        }

        $query = "";
        $params = [];

        if (in_array($role, ['admin', 'staff', 'partner'])) {
            // --- Query for Admins/, Staff, Partners (Sees ALL clients) ---
            $query = "SELECT id, name, email, contact, address, created_at
                      FROM " . $this->table_name . "
                      ORDER BY name ASC";
        } else {
            // --- Query for Lawyers (Sees only *their* clients) ---
            // This selects distinct clients linked to cases where the lawyer_id matches the user
            $query = "SELECT DISTINCT cl.id, cl.name, cl.email, cl.contact, cl.address, cl.created_at
                      FROM " . $this->table_name . " cl
                      JOIN cases c ON cl.id = c.client_id
                      WHERE c.lawyer_id = :user_id
                      ORDER BY cl.name ASC";
            $params[':user_id'] = $user_id;
        }

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Read a single client by ID.
     * (No changes needed to this method)
     */
    function readOne() {
        // ... (existing readOne code)
        $query = "SELECT id, name, email, contact, address, created_at FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->contact = $row['contact'];
            $this->address = $row['address'];
            $this->created_at = $row['created_at'];
        }
    }

    /**
     * Create a new client record.
     * (No changes needed to this method)
     */
    function create(): bool {
        // ... (existing create code)
        $query = "INSERT INTO " . $this->table_name . " SET user_id = :user_id, name = :name, email = :email, contact = :contact, address = :address";
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->contact = htmlspecialchars(strip_tags($this->contact));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":contact", $this->contact);
        $stmt->bindParam(":address", $this->address);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    /**
     * Update an existing client record.
     * (No changes needed to this method)
     */
    function update(): bool {
        // ... (existing update code)
        $query = "UPDATE " . $this->table_name . " SET name = :name, email = :email, contact = :contact, address = :address WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->contact = htmlspecialchars(strip_tags($this->contact));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':name', $this->name);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':contact', $this->contact);
        $stmt->bindParam(':address', $this->address);
        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    /**
     * Delete a client record.
     * (No changes needed to this method)
     */
    function delete(): bool {
        // ... (existing delete code)
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