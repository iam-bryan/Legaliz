<?php
// /api/objects/schedule.php

class Schedule {
    private $conn;
    private $table_name = "schedules";

    // Object Properties
    public $id;
    public $case_id;
    public $scheduled_by;
    public $event_title;
    public $start_date; // Should be in 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DDTHH:MM' format
    public $end_date;
    public $location;
    public $notes;
    public $status; // ENUM('Upcoming', 'Today', 'Completed', 'Cancelled')

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Runs automatic status updates based on the current date.
     * Should be called before any read operation.
     */
        private function updateStatusesBasedOnDate() {
        try {
            // Use CURDATE() for date comparison in SQL
            // 1. Upcoming -> Today if start_date is today
            $sql_today = "UPDATE " . $this->table_name . "
                          SET status = 'Today'
                          WHERE start_date >= CURDATE()
                            AND start_date < CURDATE() + INTERVAL 1 DAY
                            AND status = 'Upcoming'";
            $this->conn->query($sql_today);

            // 2. Upcoming or Today -> Completed if start_date is in the past
            $sql_past = "UPDATE " . $this->table_name . "
                         SET status = 'Completed'
                         WHERE start_date < CURDATE()
                           AND (status = 'Upcoming' OR status = 'Today')";
            $this->conn->query($sql_past);
        } catch (PDOException $e) {
            error_log("Error updating schedule statuses: " . $e->getMessage());
        }
    }

    /**
     * Calculates the status based on the start date.
     * @return string The calculated status ('Upcoming', 'Today', 'Completed').
     */
    private function calculateStatusBasedOnDate(): string {
        if (empty($this->start_date)) {
            return 'Upcoming'; // Default changed
        }
        try {
            $event_date_only = date('Y-m-d', strtotime($this->start_date));
            $today = date('Y-m-d'); // Use server's current date

            if ($event_date_only == $today) {
                return 'Today';     // CHANGED
            } elseif ($event_date_only < $today) {
                return 'Completed'; // Event date is in the past
            } else {
                return 'Upcoming';  // CHANGED (Event date is in the future)
            }
        } catch (Exception $e) {
            error_log("Error calculating status based on date: " . $e->getMessage());
            return 'Upcoming'; // Fallback changed
        }
    }

    // --- read(), readByCase() methods ---
    // Make sure these methods call $this->updateStatusesBasedOnDate(); at the beginning.
    // The code inside them doesn't need to change further as they just fetch the (now correct) status.
    public function read($user_id, $role, $start_range, $end_range) {
        $this->updateStatusesBasedOnDate();
        // ... rest of the read method from before ...
         // Original query (adjusted table/column names if necessary)
        $query = "SELECT s.id, s.event_title as title, s.start_date as start, s.end_date as end, c.title as case_title, s.case_id, s.location, s.notes, s.status
                  FROM " . $this->table_name . " s
                  LEFT JOIN cases c ON s.case_id = c.id";

        $where_clause = " WHERE s.start_date BETWEEN :start_range AND :end_range";
        $params = [
            ':start_range' => $start_range,
            ':end_range' => $end_range
        ];

        // Role-based filtering (assuming 'cases' table has 'lawyer_id' and 'client_id' which links to 'clients' table with 'user_id')
        switch ($role) {
            case 'admin':
                // ADMIN: Block access to schedules (Mirroring Case access restriction)
                $where_clause .= " AND 1 = 0";
                break;

            case 'partner':
            case 'staff':
                // PARTNER and STAFF: See all schedules. No extra filtering needed.
                break;
                
            case 'lawyer':
                // LAWYER: Only see schedules for cases assigned to them.
                // Join needed only if filtering by lawyer
                 if (!str_contains($query, "case_filter_lawyer")) { // Avoid duplicate joins if role logic added elsewhere
                    $query .= " JOIN cases case_filter_lawyer ON s.case_id = case_filter_lawyer.id";
                 }
                $where_clause .= " AND case_filter_lawyer.lawyer_id = :user_id";
                $params[':user_id'] = $user_id;
                break;
            case 'client':
                 // Join needed only if filtering by client
                 if (!str_contains($query, "case_filter_client")) { // Check if join exists
                     $query .= " JOIN cases case_filter_client ON s.case_id = case_filter_client.id";
                     $query .= " JOIN clients client_filter ON case_filter_client.client_id = client_filter.id";
                 }
                $where_clause .= " AND client_filter.user_id = :user_id";
                $params[':user_id'] = $user_id;
                break;
            // Admin/Partner see all - no extra conditions needed
        }

        $query .= $where_clause . " ORDER BY s.start_date ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        return $stmt;
    }
     public function readByCase() {
        $this->updateStatusesBasedOnDate();
        // ... rest of the readByCase method from before ...
         $query = "SELECT id, event_title as title, start_date as start, end_date as end, location, notes, status
                  FROM " . $this->table_name . "
                  WHERE case_id = :case_id
                  ORDER BY start_date ASC";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->case_id=htmlspecialchars(strip_tags($this->case_id));

        $stmt->bindParam(":case_id", $this->case_id);

        $stmt->execute();
        return $stmt;
    }


    /**
     * Creates a new schedule event.
     * Calculates status automatically based on start_date.
     */
    public function create(): bool {
        // --- CALCULATE STATUS ---
        $this->status = $this->calculateStatusBasedOnDate(); // Uses new logic
        // --- END STATUS CALCULATION ---

        $query = "INSERT INTO " . $this->table_name . "
                  SET case_id=:case_id, scheduled_by=:scheduled_by, event_title=:event_title, start_date=:start_date, end_date=:end_date, location=:location, notes=:notes, status=:status";
        $stmt = $this->conn->prepare($query);

        // Sanitize (No changes needed here)
        $this->case_id=htmlspecialchars(strip_tags($this->case_id));
        $this->scheduled_by=htmlspecialchars(strip_tags($this->scheduled_by));
        $this->event_title=htmlspecialchars(strip_tags($this->event_title));
        $this->start_date=htmlspecialchars(strip_tags($this->start_date));
        $this->end_date=!empty($this->end_date) ? htmlspecialchars(strip_tags($this->end_date)) : null;
        $this->location=htmlspecialchars(strip_tags($this->location));
        $this->notes=htmlspecialchars(strip_tags($this->notes));

        // Bind values
        $stmt->bindParam(":case_id", $this->case_id);
        $stmt->bindParam(":scheduled_by", $this->scheduled_by);
        $stmt->bindParam(":event_title", $this->event_title);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":status", $this->status); // Bind the calculated status ('Upcoming', 'Today', 'Completed')

        if($stmt->execute()){
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        error_log("Schedule Create Error: " . implode(":", $stmt->errorInfo()));
        return false;
    }

    /**
     * Updates an existing schedule event.
     * Recalculates status based on start_date. Allows manual override to 'Cancelled'.
     */
    public function update(?string $requested_status = null): bool { // Allow passing a requested status for 'Cancelled'
        // --- RECALCULATE STATUS ---
        $calculated_status = $this->calculateStatusBasedOnDate(); // Uses new logic

        // Allow manual override ONLY for 'Cancelled'
        $final_status = ($requested_status === 'Cancelled') ? 'Cancelled' : $calculated_status;
        // --- END STATUS RECALCULATION ---

        $query = "UPDATE " . $this->table_name . "
                  SET event_title=:event_title,
                      start_date=:start_date,
                      end_date=:end_date,
                      location=:location,
                      notes=:notes,
                      status=:status /* Use final status */
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);

        // Sanitize (No changes needed here)
        $this->id=htmlspecialchars(strip_tags($this->id));
        $this->event_title=htmlspecialchars(strip_tags($this->event_title));
        $this->start_date=htmlspecialchars(strip_tags($this->start_date));
        $this->end_date=!empty($this->end_date) ? htmlspecialchars(strip_tags($this->end_date)) : null;
        $this->location=htmlspecialchars(strip_tags($this->location));
        $this->notes=htmlspecialchars(strip_tags($this->notes));

        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":event_title", $this->event_title);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":notes", $this->notes);
        $stmt->bindParam(":status", $final_status); // Bind the final status

        if($stmt->execute()){
            return $stmt->rowCount() > 0;
        }
        error_log("Schedule Update Error: " . implode(":", $stmt->errorInfo()));
        return false;
    }

    /**
     * Deletes a schedule event.
     */
    public function delete(): bool {
        // No changes needed here
         $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);

        $this->id=htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);

        if($stmt->execute()){
             return $stmt->rowCount() > 0; // Ensure a row was actually deleted
        }
         error_log("Schedule Delete Error: " . implode(":", $stmt->errorInfo())); // Log error
        return false;
    }
}