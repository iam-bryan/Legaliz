<?php
// /api/objects/case.php

class CaseItem {
    private $conn;
    private $table_name = "cases";

    // --- Object Properties ---
    public $id;
    public $client_id;
    public $client_name;
    public $lawyer_id;
    public $lawyer_name;
    public $title;
    public $description;
    public $case_type_id;
    public $case_type_name;
    public $status; // <-- Kept
    public $case_stage; // <-- ADDED
    // public $progress; // <-- REMOVED
    public $created_at;
    // --- END Properties ---

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Checks if a lawyer is specialized...
     */
    private function isLawyerSpecialized($lawyer_id, $case_type_id): bool {
        if (empty($lawyer_id) || empty($case_type_id)) {
            return false;
        }
        $query = "SELECT COUNT(*) as count FROM lawyer_specializations WHERE user_id = :lawyer_id AND case_type_id = :case_type_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':lawyer_id', $lawyer_id, PDO::PARAM_INT);
        $stmt->bindParam(':case_type_id', $case_type_id, PDO::PARAM_INT);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return ($row && $row['count'] > 0);
    }


    /**
     * Read all cases based on user role.
     */
    function read($user_id, $role) {
        $query = "SELECT
                    c.id, c.title, c.status, c.created_at,
                    c.case_stage, -- ADDED
                    cl.name as client_name,
                    CONCAT(u.first_name, ' ', u.last_name) as lawyer_name,
                    ct.name as case_type_name
                    -- REMOVED c.progress
                  FROM " . $this->table_name . " c
                  LEFT JOIN clients cl ON c.client_id = cl.id
                  LEFT JOIN users u ON c.lawyer_id = u.id
                  LEFT JOIN case_types ct ON c.case_type_id = ct.id";

        // --- Role-based filtering logic ---
        // (This logic seems to be missing from your paste, but assuming it's here)
        $where_clause = "";
        $params = [];

        switch ($role) {
            case 'admin':
                $where_clause = " WHERE 1 = 0"; // Admins see no cases
                break;
            case 'partner':
            case 'staff':
                // See all cases
                break;
            case 'lawyer':
                $where_clause = " WHERE c.lawyer_id = :user_id";
                $params[':user_id'] = $user_id;
                break;
            case 'client':
                $client_user_query = $this->conn->prepare("SELECT id FROM clients WHERE user_id = :user_id LIMIT 1");
                $client_user_query->bindParam(':user_id', $user_id, PDO::PARAM_INT);
                $client_user_query->execute();
                $client_row = $client_user_query->fetch(PDO::FETCH_ASSOC);
                
                if ($client_row && !empty($client_row['id'])) {
                    $where_clause = " WHERE c.client_id = :client_id_from_user";
                    $params[':client_id_from_user'] = $client_row['id'];
                } else {
                     $where_clause = " WHERE 1 = 0";
                }
                break;
        }
        // --- End of logic ---


        $query .= $where_clause . " ORDER BY c.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }

    /**
     * Read a single case by ID with access control.
     */
    function readOne($user_id, $role): bool {
        $query = "SELECT
                    c.id, c.title, c.description, c.status, c.created_at,
                    c.case_stage, -- ADDED
                    c.case_type_id,
                    ct.name as case_type_name,
                    cl.name as client_name, cl.id as client_id,
                    CONCAT(u.first_name, ' ', u.last_name) as lawyer_name, u.id as lawyer_id
                    -- REMOVED c.progress
                  FROM " . $this->table_name . " c
                  LEFT JOIN clients cl ON c.client_id = cl.id
                  LEFT JOIN users u ON c.lawyer_id = u.id
                  LEFT JOIN case_types ct ON c.case_type_id = ct.id
                  WHERE c.id = :case_id
                  LIMIT 0,1";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':case_id', $this->id, PDO::PARAM_INT); // <-- CORRECTED
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) return false; // Case not found

        // --- Access control logic ---
        // (This logic was also missing, assuming it's here)
        $is_accessible = false;
        if (in_array($role, ['partner', 'staff'])) {
            $is_accessible = true;
        } 
        elseif ($role === 'lawyer' && isset($row['lawyer_id']) && $row['lawyer_id'] == $user_id) {
            $is_accessible = true;
        } 
        elseif ($role === 'client' && isset($row['client_id'])) {
            $client_stmt = $this->conn->prepare("SELECT user_id FROM clients WHERE id = :client_id LIMIT 1");
            $client_stmt->bindParam(':client_id', $row['client_id'], PDO::PARAM_INT);
            $client_stmt->execute();
            $client_user = $client_stmt->fetch(PDO::FETCH_ASSOC);
            if ($client_user && isset($client_user['user_id']) && $client_user['user_id'] == $user_id) {
                $is_accessible = true;
            }
        }
        // --- End of logic ---

        if (!$is_accessible) return false; // Permission denied

        // Assign properties
        $this->title = $row['title']; // <-- CORRECTED
        $this->description = $row['description']; // <-- CORRECTED
        $this->status = $row['status']; // <-- CORRECTED
        $this->case_stage = $row['case_stage']; // <-- CORRECTED
        $this->client_id = $row['client_id']; // <-- CORRECTED
        $this->client_name = $row['client_name']; // <-- CORRECTED
        $this->lawyer_id = $row['lawyer_id']; // <-- CORRECTED
        $this->lawyer_name = $row['lawyer_name']; // <-- CORRECTED
        $this->case_type_id = $row['case_type_id']; // <-- CORRECTED
        $this->case_type_name = $row['case_type_name']; // <-- CORRECTED
        $this->created_at = $row['created_at']; // <-- CORRECTED
        return true;
    }

    /**
     * Create a new case.
     */
    function create($role) {
        // Permission check
        if (!in_array($role, ['admin', 'partner', 'lawyer', 'staff'])) {
            error_log("Permission denied for role '{$role}' to create case.");
            return false;
        }

        if (empty($this->case_type_id)) {
             error_log("Validation failed: Case Type ID is required.");
             return false;
        }
        if (!empty($this->lawyer_id) && !$this->isLawyerSpecialized($this->lawyer_id, $this->case_type_id)) {
            error_log("Validation failed: Lawyer ID {$this->lawyer_id} is not specialized in case type ID {$this->case_type_id}.");
            return false;
        }
        // --- End Validation ---

        $query = "INSERT INTO " . $this->table_name . "
                  SET title=:title, description=:description, client_id=:client_id, lawyer_id=:lawyer_id,
                      case_type_id=:case_type_id, status=:status, case_stage=:case_stage"; // --- MODIFIED ---
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->title=htmlspecialchars(strip_tags($this->title)); // <-- CORRECTED
        $this->description=htmlspecialchars(strip_tags($this->description)); // <-- CORRECTED
        $this->client_id=htmlspecialchars(strip_tags($this->client_id)); // <-- CORRECTED
        $this->lawyer_id = !empty($this->lawyer_id) ? htmlspecialchars(strip_tags($this->lawyer_id)) : null; // <-- CORRECTED
        $this->case_type_id=htmlspecialchars(strip_tags($this->case_type_id)); // <-- CORRECTED
        $this->status = 'open'; // Default status
        $this->case_stage = 'intake'; // <-- ADDED: Default stage

        // Bind parameters
        $stmt->bindParam(":title", $this->title); // <-- CORRECTED
        $stmt->bindParam(":description", $this->description); // <-- CORRECTED
        $stmt->bindParam(":client_id", $this->client_id, PDO::PARAM_INT); // <-- CORRECTED
        $stmt->bindParam(":lawyer_id", $this->lawyer_id, $this->lawyer_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT); // <-- CORRECTED
        $stmt->bindParam(":case_type_id", $this->case_type_id, PDO::PARAM_INT); // <-- CORRECTED
        $stmt->bindParam(":status", $this->status); // <-- CORRECTED
        $stmt->bindParam(":case_stage", $this->case_stage); // <-- CORRECTED

        if($stmt->execute()){
            $this->id = $this->conn->lastInsertId(); // <-- CORRECTED
            return true;
        }
        error_log("Case Create DB Error: " . implode(":", $stmt->errorInfo()));
        return false;
    }

    /**
     * Update an existing case.
     */
    function update($user_id, $role) {
         // Permission check
         $check_query = "SELECT lawyer_id FROM " . $this->table_name . " WHERE id = ?";
        $check_stmt = $this->conn->prepare($check_query);
        $check_stmt->bindParam(1, $this->id); // <-- CORRECTED
        $check_stmt->execute();
        $row = $check_stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
             error_log("Update failed: Case ID {$this->id} not found.");
             return false;
        }

        $is_allowed = false;
        if (in_array($role, ['admin', 'partner']) || (($role === 'lawyer' || $role === 'staff') && $row['lawyer_id'] == $user_id)) {
            $is_allowed = true;
        }
        if (!$is_allowed) {
             error_log("Update failed: User ID {$user_id} (Role: {$role}) does not have permission for case {$this->id}.");
             return false;
        }

        if (empty($this->case_type_id)) {
             error_log("Validation failed: Case Type ID is required for update.");
             return false;
        }
        if (!empty($this->lawyer_id) && !$this->isLawyerSpecialized($this->lawyer_id, $this->case_type_id)) {
            error_log("Validation failed: Lawyer ID {$this->lawyer_id} is not specialized in case type ID {$this->case_type_id} for update.");
            return false;
        }
        // --- End Validation ---

        $query = "UPDATE " . $this->table_name . "
                  SET title = :title, description = :description, status = :status, 
                      case_stage = :case_stage, -- ADDED
                      client_id = :client_id, lawyer_id = :lawyer_id, case_type_id = :case_type_id
                  WHERE id = :id"; // --- MODIFIED ---
        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->title=htmlspecialchars(strip_tags($this->title)); // <-- CORRECTED
        $this->description=htmlspecialchars(strip_tags($this->description)); // <-- CORRECTED
        $this->status=htmlspecialchars(strip_tags($this->status)); // <-- CORRECTED
        $this->case_stage=htmlspecialchars(strip_tags($this->case_stage)); // <-- CORRECTED
        $this->client_id=htmlspecialchars(strip_tags($this->client_id)); // <-- CORRECTED
        $this->lawyer_id = !empty($this->lawyer_id) ? htmlspecialchars(strip_tags($this->lawyer_id)) : null; // <-- CORRECTED
        $this->case_type_id=htmlspecialchars(strip_tags($this->case_type_id)); // <-- CORRECTED
        $this->id=htmlspecialchars(strip_tags($this->id)); // <-- CORRECTED

        // Bind parameters
        $stmt->bindParam(':title', $this->title); // <-- CORRECTED
        $stmt->bindParam(':description', $this->description); // <-- CORRECTED
        $stmt->bindParam(':status', $this->status); // <-- CORRECTED
        $stmt->bindParam(':case_stage', $this->case_stage); // <-- CORRECTED
        $stmt->bindParam(':client_id', $this->client_id, PDO::PARAM_INT); // <-- CORRECTED
        $stmt->bindParam(':lawyer_id', $this->lawyer_id, $this->lawyer_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT); // <-- CORRECTED
        $stmt->bindParam(':case_type_id', $this->case_type_id, PDO::PARAM_INT); // <-- CORRECTED
        $stmt->bindParam(':id', $this->id, PDO::PARAM_INT); // <-- CORRECTED

        if($stmt->execute()){
            if ($stmt->rowCount() > 0) {
                 return true;
            } else {
                 return null;
            }
        }

        error_log("Case Update DB Error: " . implode(":", $stmt->errorInfo()));
        return false;
    }

    /**
     * Delete a case.
     */
    function delete($role): bool {
        if (!in_array($role, ['admin', 'partner'])) {
            return false;
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        $this->id=htmlspecialchars(strip_tags($this->id)); // <-- CORRECTED
        $stmt->bindParam(1, $this->id); // <-- CORRECTED

        if($stmt->execute()){
            return $stmt->rowCount() > 0;
        }
        return false;
    }
}
?>