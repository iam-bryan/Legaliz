<?php
session_start();
require_once __DIR__ . '/../config.php';
require_login();
include __DIR__ . '/../partials/header.php';

$user_id   = $_SESSION['user_id'];
$user_role = $_SESSION['role'] ?? '';

if (!in_array($user_role, ['lawyer', 'staff'])) {
    echo '<div class="alert alert-danger">You do not have permission to edit schedules.</div>';
    include __DIR__ . '/../partials/footer.php';
    exit;
}

// Initialize messages
$error = '';
$success = '';

// Get schedule ID
$schedule_id = $_GET['id'] ?? null;
if (!$schedule_id) {
    echo '<div class="alert alert-danger">Invalid schedule ID.</div>';
    include __DIR__ . '/../partials/footer.php';
    exit;
}

// Fetch the schedule
$stmt = $pdo->prepare("SELECT * FROM schedules WHERE id = ?");
$stmt->execute([$schedule_id]);
$schedule = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$schedule) {
    echo '<div class="alert alert-danger">Schedule not found.</div>';
    include __DIR__ . '/../partials/footer.php';
    exit;
}

// Fetch cases relevant to the user
$case_sql = "SELECT id, title FROM cases";
if ($user_role === 'lawyer') {
    $case_sql .= " WHERE lawyer_id = :user_id";
} elseif ($user_role === 'client') {
    $case_sql .= " WHERE client_id = :user_id";
}
$case_stmt = $pdo->prepare($case_sql);
if (in_array($user_role, ['lawyer', 'client'])) {
    $case_stmt->execute(['user_id' => $user_id]);
} else {
    $case_stmt->execute();
}
$cases = $case_stmt->fetchAll(PDO::FETCH_ASSOC);

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $case_id     = $_POST['case_id'] ?? null;
    $event_title = trim($_POST['event_title']);
    $event_date  = $_POST['event_date'];
    $location    = trim($_POST['location']);
    $notes       = trim($_POST['notes']);

    if (empty($event_title) || empty($event_date)) {
        $error = "Event Title and Event Date are required.";
    } else {
        $stmt = $pdo->prepare("
            UPDATE schedules
            SET case_id = ?, event_title = ?, event_date = ?, location = ?, notes = ?
            WHERE id = ?
        ");
        $ok = $stmt->execute([$case_id, $event_title, $event_date, $location, $notes, $schedule_id]);

        if ($ok) {
            $success = "Schedule updated successfully!";
            // Refresh schedule data
            $stmt2 = $pdo->prepare("SELECT * FROM schedules WHERE id = ?");
            $stmt2->execute([$schedule_id]);
            $schedule = $stmt2->fetch(PDO::FETCH_ASSOC);
        } else {
            $error = "Failed to update schedule.";
        }
    }
}
?>

<div class="container mt-4">
    <h3>Edit Schedule</h3>

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
                <option value="">-- None --</option>
                <?php foreach ($cases as $c): ?>
                    <option value="<?= $c['id'] ?>" <?= $c['id'] == $schedule['case_id'] ? 'selected' : '' ?>>
                        <?= htmlspecialchars($c['title']) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="mb-3">
            <label for="event_title" class="form-label">Event Title</label>
            <input type="text" class="form-control" name="event_title" id="event_title" value="<?= htmlspecialchars($schedule['event_title']) ?>" required>
        </div>

        <div class="mb-3">
            <label for="event_date" class="form-label">Event Date & Time</label>
            <input type="datetime-local" class="form-control" name="event_date" id="event_date" value="<?= date('Y-m-d\TH:i', strtotime($schedule['event_date'])) ?>" required>
        </div>

        <div class="mb-3">
            <label for="location" class="form-label">Location</label>
            <input type="text" class="form-control" name="location" id="location" value="<?= htmlspecialchars($schedule['location']) ?>">
        </div>

        <div class="mb-3">
            <label for="notes" class="form-label">Notes</label>
            <textarea class="form-control" name="notes" id="notes" rows="3"><?= htmlspecialchars($schedule['notes']) ?></textarea>
        </div>

        <button type="submit" class="btn btn-primary">Update Schedule</button>
        <a href="list.php" class="btn btn-secondary">Back to List</a>
    </form>
</div>

<?php include __DIR__ . '/../partials/footer.php'; ?>
