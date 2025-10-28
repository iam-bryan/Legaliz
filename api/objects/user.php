<?php
// /api/objects/user.php

class User {
    // Database connection and table name
    private $conn;
    private $table_name = "users";

    // Object properties (matching database schema v2)
    public $id;
    public $first_name;
    public $last_name;
    public $email;
    public $password; // Only used for setting/hashing, never returned
    public $role;
    public $last_login;
    public $created_at;
    public $updated_at;

    // Constructor with $db as database connection
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Checks if a given email exists in the database.
     * Populates object properties if the email is found.
     *
     * @return bool True if email exists, false otherwise.
     */
    function emailExists(): bool {
        $query = "SELECT id, first_name, last_name, password, role
                  FROM " . $this->table_name . "
                  WHERE email = ?
                  LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $this->email = htmlspecialchars(strip_tags($this->email));
        $stmt->bindParam(1, $this->email);
        $stmt->execute();
        $num = $stmt->rowCount();

        if ($num > 0) {
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->password = $row['password']; // Hashed password
            $this->role = $row['role'];
            return true;
        }
        return false;
    }

    /**
     * Creates a new user record in the database.
     *
     * @return bool True if creation was successful, false otherwise.
     */
    function create(): bool {
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    first_name = :firstname,
                    last_name = :lastname,
                    email = :email,
                    password = :password,
                    role = :role";
        $stmt = $this->conn->prepare($query);

        // Sanitize input data
        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));

        // Hash the password before saving
        $this->password = password_hash($this->password, PASSWORD_BCRYPT);

        // Bind values
        $stmt->bindParam(":firstname", $this->first_name);
        $stmt->bindParam(":lastname", $this->last_name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":password", $this->password);
        $stmt->bindParam(":role", $this->role);

        // Execute query and return status
        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        // Log error if needed: error_log(implode(":", $stmt->errorInfo()));
        return false;
    }

     /**
     * Reads all users (for Admin/Partner roles).
     * @param string $requesting_role Role of the user making the request.
     * @return PDOStatement|false Statement object on success/permission, false otherwise.
     */
    public function read($requesting_role)
    {
    // Check permissions if you have role-based logic
    if (!in_array($requesting_role, ['admin', 'partner', 'staff'])) {
        return false;
    }
    $query = "
        SELECT 
            u.id, 
            u.first_name, 
            u.last_name, 
            u.email, 
            u.role, 
            u.created_at, 
            u.last_login,
            GROUP_CONCAT(DISTINCT ct.name ORDER BY ct.name SEPARATOR ', ') AS specializations
        FROM users u
        LEFT JOIN lawyer_specializations ls ON u.id = ls.user_id
        LEFT JOIN case_types ct ON ls.case_type_id = ct.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    ";

    $stmt = $this->conn->prepare($query);
    $stmt->execute();
    return $stmt;
    }

    /**
     * Reads details of a single user by ID (for Admin/Partner roles).
     * @param string $requesting_role Role of the user making the request.
     * @return bool True if user found and accessible, false otherwise.
     */
     function readOne($requesting_role): bool {
        if (!in_array($requesting_role, ['admin', 'partner'])) {
             return false;
        }
        $query = "SELECT id, first_name, last_name, email, role, created_at, last_login FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row){
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            $this->created_at = $row['created_at'];
            $this->last_login = $row['last_login'];
            return true;
        }
        return false;
     }


    /**
     * Updates user details (first name, last name, role). Password update should be separate.
     * @param string $requesting_role Role of the user making the request.
     * @return bool True on success, false otherwise.
     */
    function update($requesting_role): bool {
        if (!in_array($requesting_role, ['admin', 'partner'])) {
             return false;
        }

        // Check if the new email already exists for another user
        if ($this->isEmailTakenByAnotherUser()) {
            error_log("Admin update failed: Email {$this->email} already taken by another user.");
            return false; // Specific error handled in endpoint
        }

        $query = "UPDATE " . $this->table_name . " SET first_name = :firstname, last_name = :lastname, email = :email, role = :role WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->role = htmlspecialchars(strip_tags($this->role));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':firstname', $this->first_name);
        $stmt->bindParam(':lastname', $this->last_name);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':role', $this->role);
        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0; // Return true only if a row was actually changed
        }
        error_log("User update failed: " . implode(":", $stmt->errorInfo()));
        return false;
    }

    /**
     * Deletes a user. Only Admin/Partner can delete.
     * @param string $requesting_role Role of the user making the request.
     * @return bool True on success, false otherwise.
     */
    function delete($requesting_role): bool {
        if (!in_array($requesting_role, ['admin', 'partner'])) {
             return false;
        }

        // --- Add checks here ---
        // Optional: Prevent deleting oneself
        // Optional: If deleting a client user, delete their corresponding 'clients' entry first

        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0; // Return true only if a row was deleted
        }
        error_log("User delete failed: " . implode(":", $stmt->errorInfo()));
        return false;
    }

    /**
     * Reads the profile information for the currently logged-in user.
     * Uses the ID already set in the object.
     * @return bool True if profile found, false otherwise.
     */
     function readProfile(): bool {
        $query = "SELECT id, first_name, last_name, email, role, created_at, last_login FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if($row){
            $this->first_name = $row['first_name'];
            $this->last_name = $row['last_name'];
            $this->email = $row['email'];
            $this->role = $row['role'];
            $this->created_at = $row['created_at'];
            $this->last_login = $row['last_login'];
            return true;
        }
        return false;
     }

    /**
     * Updates the profile information for the currently logged-in user (name, email).
     * Uses the ID already set in the object.
     * @return bool True on success, false otherwise.
     */
    function updateProfile(): bool {
        if ($this->isEmailTakenByAnotherUser()) {
             error_log("Attempt to update profile failed: Email {$this->email} already taken by another user.");
             return false; // Specific error handled in endpoint
        }

        $query = "UPDATE " . $this->table_name . " SET first_name = :firstname, last_name = :lastname, email = :email WHERE id = :id";
        $stmt = $this->conn->prepare($query);

        $this->first_name = htmlspecialchars(strip_tags($this->first_name));
        $this->last_name = htmlspecialchars(strip_tags($this->last_name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->id = htmlspecialchars(strip_tags($this->id)); // ID comes from token, assumed safe

        $stmt->bindParam(':firstname', $this->first_name);
        $stmt->bindParam(':lastname', $this->last_name);
        $stmt->bindParam(':email', $this->email);
        $stmt->bindParam(':id', $this->id);

        if ($stmt->execute()) {
            return $stmt->rowCount() > 0; // Return true only if changes were made
        }
        error_log("Profile update failed: " . implode(":", $stmt->errorInfo()));
        return false;
    }

    /**
     * Helper function to check if the provided email is already used by *another* user.
     * Used by both update() and updateProfile().
     * @return bool True if email is taken by someone else, false otherwise.
     */
    private function isEmailTakenByAnotherUser(): bool {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email AND id != :id LIMIT 0,1";
        $stmt = $this->conn->prepare($query);

        $email = htmlspecialchars(strip_tags($this->email));
        $id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':id', $id);

        $stmt->execute();
        return $stmt->rowCount() > 0;
    }

}
?>