<?php 
require_once __DIR__ . '/config.php'; 
require_login(); 
include __DIR__ . '/partials/header.php'; 

$uid  = $_SESSION['user_id'] ?? 0;
$role = $_SESSION['role'] ?? '';

$recent_cases = [];
$total_cases = 0;
$total_clients = 0;

if ($role === 'lawyer') {
    // Recent cases (latest 5)
    $stmt = $pdo->prepare("
        SELECT c.id, c.title, c.status, cl.name AS client_name
        FROM cases c
        LEFT JOIN clients cl ON cl.id = c.client_id
        WHERE c.lawyer_id = ?
        ORDER BY c.id DESC
        LIMIT 5
    ");
    $stmt->execute([$uid]);
    $recent_cases = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Total cases assigned
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM cases WHERE lawyer_id = ?");
    $stmt->execute([$uid]);
    $total_cases = (int) $stmt->fetchColumn();

    // Total unique clients assigned
    $stmt = $pdo->prepare("SELECT COUNT(DISTINCT client_id) FROM cases WHERE lawyer_id = ? AND client_id IS NOT NULL");
    $stmt->execute([$uid]);
    $total_clients = (int) $stmt->fetchColumn();
}
?>

<!-- Summary Cards -->
<div class="row g-4 mb-4">
    <!-- Active Cases -->
    <div class="col-md-6">
        <div class="card shadow-sm border-0">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="text-secondary">My Cases</h6>
                    <h3 class="fw-bold"><?= $total_cases ?></h3>
                </div>
                <i class="bi bi-briefcase fs-1 text-primary"></i>
            </div>
        </div>
    </div>

    <!-- Total Clients -->
    <div class="col-md-6">
        <div class="card shadow-sm border-0">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="text-secondary">Total Clients</h6>
                    <h3 class="fw-bold"><?= $total_clients ?></h3>
                </div>
                <i class="bi bi-people fs-1 text-success"></i>
            </div>
        </div>
    </div>
</div>

<!-- Recent Cases -->
<div class="card mb-3">
    <div class="card-header">Recent Cases</div>
    <div class="card-body">
        <?php if (!empty($recent_cases)): ?>
            <ul class="list-group">
                <?php foreach ($recent_cases as $c): ?>
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                            <strong><?= htmlspecialchars($c['title']) ?></strong> 
                            (<?= htmlspecialchars($c['status']) ?>) <br>
                            Client: <?= htmlspecialchars($c['client_name']) ?>
                        </span>
                        <a href="/cases/list.php" class="btn btn-sm btn-primary">View</a>
                    </li>
                <?php endforeach; ?>
            </ul>
        <?php else: ?>
            <p>No recent cases found.</p>
        <?php endif; ?>
    </div>
</div>

<?php include __DIR__ . '/partials/footer.php'; ?>
