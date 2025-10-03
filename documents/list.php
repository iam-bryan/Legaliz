<?php
session_start();
require_once __DIR__ . '/../partials/header.php';

$role = $_SESSION['role'] ?? null;
$uid  = $_SESSION['user_id'] ?? null;

// Handle deletion
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_document_id']) && in_array($role, ['admin','partner'])) {
    csrf_verify();
    $doc_id = (int)$_POST['delete_document_id'];

    $stmt = $pdo->prepare("SELECT file_path FROM documents WHERE id=?");
    $stmt->execute([$doc_id]);
    $doc = $stmt->fetch();

    if ($doc) {
        $file = __DIR__ . "/.." . $doc['file_path'];
        if (file_exists($file)) unlink($file);
        $stmt = $pdo->prepare("DELETE FROM documents WHERE id=?");
        $stmt->execute([$doc_id]);
    }

    $redir = '/documents/list.php';
    if (!empty($_POST['redirect_case_id'])) {
        $redir .= '?case_id=' . (int)$_POST['redirect_case_id'];
    }
    header("Location: " . $redir);
    exit;
}

// CASE VIEW
if (isset($_GET['case_id'])):
    $case_id = (int)$_GET['case_id'];

    $where = "WHERE cases.id=?";
    $params = [$case_id];

    if ($role === 'lawyer') {
        $where .= " AND cases.lawyer_id=?";
        $params[] = $uid;
    } elseif ($role === 'client') {
        $where .= " AND cases.client_id = (SELECT id FROM clients WHERE user_id=?)";
        $params[] = $uid;
    }

    $stmt = $pdo->prepare("SELECT cases.*, clients.name AS client_name, u.username AS lawyer_name, u.id AS lawyer_id
        FROM cases 
        LEFT JOIN clients ON clients.id = cases.client_id 
        LEFT JOIN users u ON u.id = cases.lawyer_id 
        $where");
    $stmt->execute($params);
    $case = $stmt->fetch();

    if (!$case) {
        echo "<div class='alert alert-danger'>Case not found or access denied.</div>";
        require_once __DIR__ . '/../partials/footer.php';
        exit;
    }
    ?>

<div class="container mt-4">
    <h3>Case Details</h3>
    <table class="table table-bordered mb-4">
        <tr><th>ID</th><td><?=htmlspecialchars($case['id'])?></td></tr>
        <tr><th>Title</th><td><?=htmlspecialchars($case['title'])?></td></tr>
        <tr><th>Description</th><td><?=htmlspecialchars($case['description'])?></td></tr>
        <tr><th>Status</th><td><?=htmlspecialchars($case['status'])?></td></tr>
        <tr><th>Client</th><td><?=htmlspecialchars($case['client_name'])?></td></tr>
        <tr><th>Lawyer</th><td><?=htmlspecialchars($case['lawyer_name'] ?? 'Unassigned')?></td></tr>
        <tr><th>Created At</th><td><?=htmlspecialchars($case['created_at'])?></td></tr>
    </table>

    <div class="mb-3">
        <?php if (in_array($role, ['admin','partner','client']) || ($role === 'lawyer' && $uid == $case['lawyer_id'])): ?>
            <a href="/documents/add.php?case_id=<?=$case_id?>" class="btn btn-sm btn-primary">Add Document</a>
        <?php endif; ?>
        <a href="/cases/list.php" class="btn btn-sm btn-secondary">Back to Cases</a>
    </div>

    <h3>Documents</h3>
    <?php
    $stmt = $pdo->prepare("SELECT d.*, u.username AS uploader, cl.name AS client_name
        FROM documents d
        LEFT JOIN users u ON u.id = d.uploaded_by
        LEFT JOIN cases c ON c.id = d.case_id
        LEFT JOIN clients cl ON c.client_id = cl.id
        WHERE d.case_id=? 
        ORDER BY d.id DESC");
    $stmt->execute([$case_id]);
    $docs = $stmt->fetchAll();

    if (!$docs):
        echo "<div class='alert alert-info'>No documents uploaded yet.</div>";
    else: ?>
        <div class="row">
            <?php foreach ($docs as $d): ?>
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">
                                <a href="<?=htmlspecialchars($d['file_path'])?>" target="_blank">
                                    <?=htmlspecialchars($d['title'] ?? 'Untitled')?>
                                </a>
                            </h5>
                            <p class="card-text"><strong>File:</strong> <?=htmlspecialchars($d['file_name'])?></p>
                            <p class="card-text"><strong>Client:</strong> <?=htmlspecialchars($d['client_name'] ?? 'Unknown')?></p>
                            <p class="card-text"><strong>Uploaded By:</strong> <?=htmlspecialchars($d['uploader'] ?? 'System')?></p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <div>
                                <a href="<?=htmlspecialchars($d['file_path'])?>" target="_blank" class="btn btn-sm btn-info me-1">View</a>
                                <a href="<?=htmlspecialchars($d['file_path'])?>" download="<?=htmlspecialchars($d['file_name'])?>" class="btn btn-sm btn-success me-1">Download</a>
                            </div>
                            <?php if (in_array($role, ['admin','partner'])): ?>
                                <form method="post" onsubmit="return confirm('Delete this document?');" style="display:inline-block">
                                    <?php csrf_field(); ?>
                                    <input type="hidden" name="delete_document_id" value="<?=$d['id']?>">
                                    <input type="hidden" name="redirect_case_id" value="<?=$case_id?>">
                                    <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>

<?php else: // ALL DOCUMENTS VIEW ?>
<div class="container mt-4">
    <h3>All Documents</h3>
    <p>
        <?php if (in_array($role, ['admin','partner','client','lawyer'])): ?>
            <a href="/documents/add.php" class="btn btn-sm btn-primary">Upload Document</a>
        <?php endif; ?>
    </p>

    <!-- Case Filter -->
    <?php
    $filter_case_id = isset($_GET['filter_case_id']) ? (int)$_GET['filter_case_id'] : 0;
    $cases_sql = "SELECT id, title FROM cases";
    $params = [];
    $where = [];

    if ($role === 'lawyer') {
        $where[] = "lawyer_id=?";
        $params[] = $uid;
    } elseif ($role === 'client') {
        $where[] = "client_id = (SELECT id FROM clients WHERE user_id=?)";
        $params[] = $uid;
    }

    if ($where) {
        $cases_sql .= " WHERE " . implode(" AND ", $where);
    }
    $cases_sql .= " ORDER BY title ASC";

    $cases_stmt = $pdo->prepare($cases_sql);
    $cases_stmt->execute($params);
    $all_cases = $cases_stmt->fetchAll();
    ?>
    <form method="get" class="mb-3 d-flex align-items-center">
        <label for="filter_case_id" class="me-2">Filter by Case:</label>
        <select name="filter_case_id" id="filter_case_id" class="form-select w-auto me-2" onchange="this.form.submit()">
            <option value="0">-- All Cases --</option>
            <?php foreach ($all_cases as $c): ?>
                <option value="<?=$c['id']?>" <?=$filter_case_id == $c['id'] ? 'selected' : ''?>><?=htmlspecialchars($c['title'])?></option>
            <?php endforeach; ?>
        </select>
        <?php if ($filter_case_id > 0): ?>
            <a href="/documents/list.php" class="btn btn-secondary btn-sm">Clear Filter</a>
        <?php endif; ?>
    </form>

    <?php
    $base_sql = "
        SELECT d.*, u.username AS uploader, c.title AS case_title, c.id AS case_id, cl.name AS client_name
        FROM documents d
        LEFT JOIN users u ON u.id = d.uploaded_by
        LEFT JOIN cases c ON c.id = d.case_id
        LEFT JOIN clients cl ON c.client_id = cl.id
    ";
    $where = [];
    $params = [];

    if ($role === 'lawyer') {
        $where[] = "c.lawyer_id = ?";
        $params[] = $uid;
    } elseif ($role === 'client') {
        $where[] = "c.client_id = (SELECT id FROM clients WHERE user_id=?)";
        $params[] = $uid;
    }

    if ($filter_case_id > 0) {
        $where[] = "c.id = ?";
        $params[] = $filter_case_id;
    }

    if ($where) $base_sql .= " WHERE " . implode(" AND ", $where);
    $base_sql .= " ORDER BY d.id DESC";

    $stmt = $pdo->prepare($base_sql);
    $stmt->execute($params);
    $docs = $stmt->fetchAll();

    if (!$docs):
        echo "<div class='alert alert-info'>No documents uploaded yet.</div>";
    else: ?>
        <div class="row">
            <?php foreach ($docs as $d): ?>
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="card h-100 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">
                                <p><?=htmlspecialchars($d['title'] ?? 'Untitled')?></a>
                            </h5>
                            <p class="card-text"><strong>File:</strong> <?=htmlspecialchars($d['file_name'])?></p>
                            <p class="card-text"><strong>Case:</strong>
                                <?php if (!empty($d['case_id'])): ?>
                                    <a href="/documents/list.php?case_id=<?=$d['case_id']?>"><?=htmlspecialchars($d['case_title'] ?? 'Case '.$d['case_id'])?></a>
                                <?php else: ?>
                                    <em>Unassigned</em>
                                <?php endif; ?>
                            </p>
                            <p class="card-text"><strong>Client:</strong> <?=htmlspecialchars($d['client_name'] ?? 'Unknown')?></p>
                            <p class="card-text"><strong>Uploaded By:</strong> <?=htmlspecialchars($d['uploader'] ?? 'System')?></p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <div>
                                <a href="<?=htmlspecialchars($d['file_path'])?>" target="_blank" class="btn btn-sm btn-info me-1">View</a>
                                <a href="<?=htmlspecialchars($d['file_path'])?>" download="<?=htmlspecialchars($d['file_name'])?>" class="btn btn-sm btn-success me-1">Download</a>
                            </div>
                            <?php if (in_array($role, ['admin','partner'])): ?>
                                <form method="post" onsubmit="return confirm('Delete this document?');" style="display:inline-block">
                                    <?php csrf_field(); ?>
                                    <input type="hidden" name="delete_document_id" value="<?=$d['id']?>">
                                    <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
</div>
<?php endif; ?>

<?php require_once __DIR__ . '/../partials/footer.php'; ?>
