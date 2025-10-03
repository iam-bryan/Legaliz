<?php
session_start();
require_once __DIR__ . '/../partials/header.php';

$role = $_SESSION['role'] ?? null;
$uid  = $_SESSION['user_id'] ?? null;

// Determine if case_id is passed (from case interface)
$preselected_case_id = isset($_GET['case_id']) ? (int)$_GET['case_id'] : null;

// Fetch cases user can upload to (only if no preselected case)
$cases = [];
if (!$preselected_case_id) {
    if ($role === 'admin' || $role === 'partner') {
        $stmt = $pdo->query("SELECT id, title FROM cases ORDER BY created_at DESC");
    } elseif ($role === 'lawyer') {
        $stmt = $pdo->prepare("SELECT id, title FROM cases WHERE lawyer_id=? ORDER BY created_at DESC");
        $stmt->execute([$uid]);
    } elseif ($role === 'client') {
        $stmt = $pdo->prepare("SELECT id, title FROM cases WHERE client_id=? ORDER BY created_at DESC");
        $stmt->execute([$uid]);
    } else {
        $stmt = $pdo->query("SELECT id, title FROM cases WHERE 1=0");
    }
    $cases = $stmt->fetchAll();
}

// Handle upload
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $title   = $_POST['title'] ?? null;
    $case_id = $preselected_case_id ?: ($_POST['case_id'] ?? null);

    if (!$case_id) {
        echo "<div class='alert alert-danger'>You must select a case.</div>";
    } elseif (!$title) {
        echo "<div class='alert alert-danger'>Title is required.</div>";
    } elseif (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
        echo "<div class='alert alert-danger'>Please upload a PDF file.</div>";
    } else {
        $file = $_FILES['document'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

        if ($ext !== 'pdf') {
            echo "<div class='alert alert-danger'>Only PDF files are allowed.</div>";
        } else {
            $uploadDir = "/uploads/documents/";
            $uploadPath = __DIR__ . "/.." . $uploadDir;

            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }

            $newFileName = uniqid("doc_", true) . ".pdf";
            $filePath = $uploadPath . $newFileName;
            $dbFilePath = $uploadDir . $newFileName;

            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                $stmt = $pdo->prepare("INSERT INTO documents (case_id, uploaded_by, title, file_name, file_path, uploaded_at) 
                    VALUES (?, ?, ?, ?, ?, NOW())");
                $stmt->execute([$case_id, $uid, $title, $file['name'], $dbFilePath]);

                // Redirect back to case documents if coming from a case
                if ($preselected_case_id) {
                    header("Location: /documents/list.php?case_id=" . $preselected_case_id);
                } else {
                    header("Location: /documents/list.php");
                }
                exit;
            } else {
                echo "<div class='alert alert-danger'>File upload failed.</div>";
            }
        }
    }
}
?>

<h3>Upload Document</h3>
<form method="post" enctype="multipart/form-data">
    <?php csrf_field(); ?>

    <?php if (!$preselected_case_id): ?>
        <div class="mb-3">
            <label class="form-label">Select Case</label>
            <select name="case_id" class="form-control" required>
                <option value="">-- Select Case --</option>
                <?php foreach ($cases as $c): ?>
                    <option value="<?=$c['id']?>"><?=htmlspecialchars($c['title'])?></option>
                <?php endforeach; ?>
            </select>
        </div>
    <?php else: ?>
        <input type="hidden" name="case_id" value="<?=$preselected_case_id?>">
    <?php endif; ?>

    <div class="mb-3">
        <label class="form-label">Title</label>
        <input type="text" name="title" class="form-control" required>
    </div>
    <div class="mb-3">
        <label class="form-label">Upload PDF</label>
        <input type="file" name="document" class="form-control" accept="application/pdf" required>
    </div>
    <button type="submit" class="btn btn-primary">Upload</button>
    <a href="<?=$preselected_case_id ? '/documents/list.php?case_id='.$preselected_case_id : '/documents/list.php'?>" class="btn btn-secondary">Cancel</a>
</form>

<?php require_once __DIR__ . '/../partials/footer.php'; ?>
```
