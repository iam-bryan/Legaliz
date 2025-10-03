<?php 
session_start();
require_once __DIR__ . '/../config.php'; 
require_once __DIR__ . '/../partials/header.php'; 

$uid  = $_SESSION['user_id'];
$role = $_SESSION['role'];

if ($role === 'lawyer') {
    // Restrict to only clients assigned to THIS lawyer
    $stmt = $pdo->prepare("
        SELECT c.*
        FROM clients c
        JOIN cases cs ON cs.client_id = c.id
        WHERE cs.lawyer_id = ?
        GROUP BY c.id
        ORDER BY c.id DESC
    ");
    $stmt->execute([$uid]);
    $clients = $stmt->fetchAll();
} else {
    // Partners (and staff/admin) can see all clients
    $stmt = $pdo->query("SELECT * FROM clients ORDER BY id DESC");
    $clients = $stmt->fetchAll();
}
?>

<h3>Clients</h3>

<p>
<?php if ($_SESSION['role'] === 'client'): ?>
    <button class="btn btn-sm btn-secondary" disabled>Add Client (Disabled)</button>
<?php else: ?>
    <a class='btn btn-sm btn-primary' href='/clients/add.php'>Add Client</a>
<?php endif; ?>
</p>

<table class='table'>
    <thead>
        <tr>
            <th>ID</th><th>Name</th><th>Email</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach($clients as $c): ?>
            <tr>
                <td><?=$c['id']?></td>
                <td><?=htmlspecialchars($c['name'])?></td>
                <td><?=htmlspecialchars($c['email'])?></td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<?php require_once __DIR__ . '/../partials/footer.php'; ?>
