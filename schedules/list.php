<?php
session_start();
require_once __DIR__ . '/../config.php';
require_login();
include __DIR__ . '/../partials/header.php';

$user_id   = $_SESSION['user_id'];
$user_role = $_SESSION['role'] ?? '';

// Fetch schedules based on role
$sql = "
    SELECT s.*, u.username AS scheduled_by_name, c.title AS case_title, c.lawyer_id, c.client_id
    FROM schedules s
    LEFT JOIN users u ON u.id = s.scheduled_by
    LEFT JOIN cases c ON c.id = s.case_id
";

// Only show schedules relevant to the user
if ($user_role === 'lawyer') {
    $sql .= " WHERE c.lawyer_id = :user_id OR (s.scheduled_by IN (SELECT id FROM users WHERE role='staff'))"; //change later when staff are connected to the lawyer
} elseif ($user_role === 'client') {
    $sql .= " WHERE c.client_id = :user_id";
} elseif ($user_role === 'staff') {
    // staff sees all schedules
} else {
    $sql .= " WHERE 1=0"; // others see nothing
}

$sql .= " ORDER BY s.event_date ASC";

$stmt = $pdo->prepare($sql);
if (in_array($user_role, ['lawyer', 'client'])) {
    $stmt->execute(['user_id' => $user_id]);
} else {
    $stmt->execute();
}

$schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Separate schedules by status
$upcoming = [];
$today    = [];
$overdue  = [];
$now      = date('Y-m-d');

foreach ($schedules as $s) {
    $event_date = date('Y-m-d', strtotime($s['event_date']));
    if ($event_date < $now) {
        $overdue[] = $s;
    } elseif ($event_date == $now) {
        $today[] = $s;
    } else {
        $upcoming[] = $s;
    }
}

// Sort schedules
usort($overdue, fn($a,$b) => strtotime($b['event_date']) - strtotime($a['event_date']));
usort($today, fn($a,$b) => strtotime($a['event_date']) - strtotime($b['event_date']));
usort($upcoming, fn($a,$b) => strtotime($a['event_date']) - strtotime($b['event_date']));

// Render function
function render_schedule_cards($schedules_array, $status = 'upcoming', $user_role = '') {
    if (empty($schedules_array)) {
        echo '<div class="alert alert-info text-center">No schedules found.</div>';
        return;
    }

    echo '<div class="row">';
    foreach ($schedules_array as $s) {
        switch ($status) {
            case 'overdue': $header_class = 'bg-danger text-white'; break;
            case 'today':   $header_class = 'bg-warning text-dark'; break;
            default:        $header_class = 'bg-primary text-white';
        }

        echo '<div class="col-md-4 mb-3">';
        echo '<div class="card h-100 shadow-sm border-0">';
        echo '<div class="card-header ' . $header_class . '">' . htmlspecialchars($s['event_title']) . '</div>';
        echo '<div class="card-body">';
        echo '<p><strong>Case:</strong> ' . htmlspecialchars($s['case_title'] ?? 'N/A') . '</p>';
        echo '<p><strong>Date:</strong> ' . date("F j, Y g:i A", strtotime($s['event_date'])) . '</p>';
        echo '<p><strong>Location:</strong> ' . htmlspecialchars($s['location']) . '</p>';
        if (!empty($s['notes'])) {
            echo '<p><strong>Notes:</strong> ' . htmlspecialchars($s['notes']) . '</p>';
        }
        echo '</div>';

        // Footer with created info
        echo '<div class="card-footer bg-light text-muted small d-flex justify-content-between">';
        echo '<span>By: ' . htmlspecialchars($s['scheduled_by_name'] ?? 'Unknown') . '</span>';
        echo '<span>Created: ' . (!empty($s['created_at']) ? date("M j, Y g:i A", strtotime($s['created_at'])) : 'N/A') . '</span>';
        echo '</div>';

        // Edit button only for lawyer and staff
        if (in_array($user_role, ['lawyer', 'staff'])) {
            echo '<div class="card-footer bg-light text-end">';
            echo '<a href="edit_sched.php?id=' . $s['id'] . '" class="btn btn-sm btn-warning">Edit</a>';
            echo '</div>';
        }

        echo '</div></div>';
    }
    echo '</div>';
}
?>

<div class="container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark">Event Schedules</h2>
        <a class="btn btn-success" href="add_sched.php"><i class="bi bi-plus-lg me-1"></i> New Event Schedule</a>
    </div>

    <h2 class="mb-3 mt-4">Overdue</h2>
    <?php render_schedule_cards($overdue, 'overdue', $user_role); ?>

    <h2 class="mb-3 mt-5">Today's Schedule</h2>
    <?php render_schedule_cards($today, 'today', $user_role); ?>

    <h2 class="mb-3 mt-5">Upcoming Schedule</h2>
    <?php render_schedule_cards($upcoming, 'upcoming', $user_role); ?>
</div>

<?php include __DIR__ . '/../partials/footer.php'; ?>
