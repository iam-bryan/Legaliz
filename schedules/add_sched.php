<?php
session_start();
require_once __DIR__ . '/../config.php'; 
require_login();

// Initialize error/success messages
$error = '';
$success = '';

// Get current user info
$user_id   = $_SESSION['user_id'];
$user_role = $_SESSION['role'] ?? ''; // expecting 'lawyer', 'client', 'staff', etc.

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $case_id      = $_POST['case_id'] ?? null;
    $event_title  = trim($_POST['event_title']);
    $event_date   = $_POST['event_date'];
    $location     = trim($_POST['location']);
    $notes        = trim($_POST['notes']);
    $scheduled_by = $user_id;

    if (empty($event_title) || empty($event_date)) {
        $error = "Event Title and Event Date are required.";
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO schedules (case_id, scheduled_by, event_title, event_date, location, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");
        $ok = $stmt->execute([$case_id, $scheduled_by, $event_title, $event_date, $location, $notes]);

        if ($ok) {
            $success = "Schedule created successfully!";
        } else {
            $error = "Failed to create schedule.";
        }
    }
}

// Fetch cases assigned to the current user
if ($user_role === 'lawyer') {
    $stmt = $pdo->prepare("SELECT id, title FROM cases WHERE lawyer_id = ? ORDER BY id DESC");
    $stmt->execute([$user_id]);
} elseif ($user_role === 'client') {
    $stmt = $pdo->prepare("SELECT id, title FROM cases WHERE client_id = ? ORDER BY id DESC");
    $stmt->execute([$user_id]);
} elseif ($user_role === 'staff') {
    // Staff can see all cases
    $stmt = $pdo->prepare("SELECT id, title FROM cases ORDER BY id DESC");
    $stmt->execute();
} else {
    // No access to any cases
    $stmt = $pdo->prepare("SELECT id, title FROM cases WHERE 1=0"); // empty set
    $stmt->execute();
}

$cases = $stmt->fetchAll(PDO::FETCH_ASSOC);

include __DIR__ . '/../partials/header.php';
?>

<div class="container mt-4">
    <h3>Create Schedule</h3>

    <?php if ($error): ?>
        <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>

    <?php if ($success): ?>
        <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
    <?php endif; ?>

    <form method="post">
        <div class="mb-3">
            <label for="case_id" class="form-label">Case</label>
            <select name="case_id" id="case_id" class="form-select">
                <?php if ($user_role === 'staff'): ?>
                    <option value="">-- None --</option>
                <?php endif; ?>
                <?php foreach ($cases as $c): ?>
                    <option value="<?= $c['id'] ?>"><?= htmlspecialchars($c['title']) ?></option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="mb-3">
            <label for="event_title" class="form-label">Event Title</label>
            <input type="text" class="form-control" name="event_title" id="event_title" required>
        </div>

        <div class="mb-3">
            <label for="event_date" class="form-label">Event Date & Time</label>
            <input type="datetime-local" class="form-control" name="event_date" id="event_date" required>
        </div>

        <div class="mb-3">
            <label for="location" class="form-label">Location</label>
            <input type="text" class="form-control" name="location" id="location">
        </div>

        <div class="mb-3">
            <label for="notes" class="form-label">Notes</label>
            <textarea class="form-control" name="notes" id="notes" rows="3"></textarea>
        </div>

        <button type="submit" class="btn btn-primary">Save Schedule</button>
        <a href="list.php" class="btn btn-secondary">Back to List</a>
    </form>
</div>

<?php include __DIR__ . '/../partials/footer.php'; ?>
