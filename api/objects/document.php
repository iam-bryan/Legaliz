<?php
// /api/objects/document.php

class Document {
    private $conn;
    private $table_name = "documents";

    // Object Properties
    public $id;
    public $case_id;
    public $title;
    public $uploaded_by;
    public $file_name;
    public $file_path;
    public $document_type;
    public $uploaded_at;
    public $tags; // Array of tag names

    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Creates a new document record in the database after a successful file upload.
     */
    public function create(): bool {
        $query = "INSERT INTO " . $this->table_name . "
                  SET
                    case_id=:case_id,
                    title=:title,
                    uploaded_by=:uploaded_by,
                    file_name=:file_name,
                    file_path=:file_path,
                    document_type=:document_type";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->case_id=htmlspecialchars(strip_tags($this->case_id));
        $this->title=htmlspecialchars(strip_tags($this->title));
        $this->uploaded_by=htmlspecialchars(strip_tags($this->uploaded_by));
        $this->file_name=htmlspecialchars(strip_tags($this->file_name));
        $this->file_path=htmlspecialchars(strip_tags($this->file_path));
        $this->document_type=htmlspecialchars(strip_tags($this->document_type));

        $stmt->bindParam(":case_id", $this->case_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":uploaded_by", $this->uploaded_by);
        $stmt->bindParam(":file_name", $this->file_name);
        $stmt->bindParam(":file_path", $this->file_path);
        $stmt->bindParam(":document_type", $this->document_type);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return $this->handleTags(); // Handle tags after document creation
        }
        return false;
    }

    /**
     * Reads all documents associated with a specific case.
     */
    public function readByCase() {
        $query = "SELECT d.id, d.title, d.file_name, d.file_path, d.document_type, d.uploaded_at, CONCAT(u.first_name, ' ', u.last_name) as uploaded_by_name
                  FROM " . $this->table_name . " d
                  LEFT JOIN users u ON d.uploaded_by = u.id
                  WHERE d.case_id = ?
                  ORDER BY d.uploaded_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->case_id);
        $stmt->execute();
        return $stmt;
    }

    /**
     * Deletes a document record from the database and its corresponding file from the server.
     */
    public function delete($role): bool {
        // Permission check: Only admins, partners, and the lawyer/staff on the case can delete.
        // For simplicity, we'll allow admin/partner roles here. A more granular check would involve fetching the case lawyer.
        if (!in_array($role, ['admin', 'partner', 'lawyer', 'staff'])) {
            return false;
        }

        // First, get the file path to delete the physical file
        $path_query = "SELECT file_path FROM " . $this->table_name . " WHERE id = ?";
        $path_stmt = $this->conn->prepare($path_query);
        $path_stmt->bindParam(1, $this->id);
        $path_stmt->execute();
        $row = $path_stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return false; // Document not found in DB
        }
        $file_to_delete = $_SERVER['DOCUMENT_ROOT'] . $row['file_path'];

        // Now, delete the database record
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(1, $this->id);

        if ($stmt->execute()) {
            // If DB deletion is successful, delete the file from the server
            if (file_exists($file_to_delete)) {
                unlink($file_to_delete);
            }
            return true;
        }
        return false;
    }

    /**
     * Handles the creation and linking of tags for a document.
     */
    private function handleTags(): bool {
        if (empty($this->tags) || !is_array($this->tags)) {
            return true; // No tags to process
        }

        foreach ($this->tags as $tag_name) {
            $tag_name = trim(htmlspecialchars(strip_tags($tag_name)));
            if (empty($tag_name)) continue;

            // Check if tag exists, get its ID
            $tag_id = null;
            $tag_query = "SELECT id FROM tags WHERE name = ?";
            $tag_stmt = $this->conn->prepare($tag_query);
            $tag_stmt->bindParam(1, $tag_name);
            $tag_stmt->execute();
            if ($tag_stmt->rowCount() > 0) {
                $row = $tag_stmt->fetch(PDO::FETCH_ASSOC);
                $tag_id = $row['id'];
            } else {
                // If tag does not exist, create it
                $insert_tag_query = "INSERT INTO tags SET name = ?";
                $insert_tag_stmt = $this->conn->prepare($insert_tag_query);
                $insert_tag_stmt->bindParam(1, $tag_name);
                if ($insert_tag_stmt->execute()) {
                    $tag_id = $this->conn->lastInsertId();
                }
            }

            // Link the tag to the document
            if ($tag_id) {
                $link_query = "INSERT INTO document_tags SET document_id = ?, tag_id = ?";
                $link_stmt = $this->conn->prepare($link_query);
                $link_stmt->bindParam(1, $this->id);
                $link_stmt->bindParam(2, $tag_id);
                $link_stmt->execute(); // Ignore if it fails (e.g., duplicate entry)
            }
        }
        return true;
    }
}
?>