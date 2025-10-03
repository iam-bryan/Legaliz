<?php 
require_once __DIR__ . '/config.php'; 
require_login(); 
include __DIR__ . '/partials/header.php'; 

// Fetch user stats
$totalAdmins = $pdo->query("SELECT COUNT(*) FROM users WHERE role='admin'")->fetchColumn();
$totalPartners = $pdo->query("SELECT COUNT(*) FROM users WHERE role='partner'")->fetchColumn();
$totalLawyers = $pdo->query("SELECT COUNT(*) FROM users WHERE role='lawyer'")->fetchColumn();
$totalStaff   = $pdo->query("SELECT COUNT(*) FROM users WHERE role='staff'")->fetchColumn();
$totalClients = $pdo->query("SELECT COUNT(*) FROM users WHERE role='client'")->fetchColumn();

// Fetch all users
$users = $pdo->query("SELECT * FROM users ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Management - LCM</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.10.0/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-blue: #2563eb;
            --secondary-gray: #6b7280;
            --light-gray: #f8fafc;
            --border-gray: #e5e7eb;
            --text-dark: #374151;
        }

        body {
            background-color: var(--light-gray);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: var(--text-dark);
        }

        .main-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }

        .page-header {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }

        .page-header i {
            font-size: 1.5rem;
            color: var(--secondary-gray);
            margin-right: 0.75rem;
        }

        .page-header h1 {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0;
            color: var(--text-dark);
        }

        .page-subtitle {
            color: var(--secondary-gray);
            font-size: 0.875rem;
            margin-left: 2.25rem;
            margin-top: 0rem;
            margin-bottom: 2rem;
        }

        .filters-section {
            background: white;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
        }

        .filter-select {
            border: 1px solid var(--border-gray);
            border-radius: 0.5rem;
            padding: 0.5rem 2rem 0.5rem 0.75rem;
            background: white;
            color: var(--text-dark);
            font-size: 0.875rem;
            min-width: 120px;
            appearance: none;
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center;
            background-repeat: no-repeat;
            background-size: 1.5em 1.5em;
        }

        .search-input {
            border: 1px solid var(--border-gray);
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            flex: 1;
            min-width: 250px;
        }

        .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1.25rem;
            border-radius: 0.75rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border-left: 4px solid;
        }

        .stat-card.admin { border-left-color: #dc2626; }
        .stat-card.partner { border-left-color: #667eea; }
        .stat-card.lawyer { border-left-color: var(--primary-blue); }
        .stat-card.staff { border-left-color: #059669; }
        .stat-card.client { border-left-color: #d97706; }

        .stat-number {
            font-size: 1.875rem;
            font-weight: 700;
            color: var(--text-dark);
        }

        .stat-label {
            color: var(--secondary-gray);
            font-size: 0.875rem;
            margin-top: 0.25rem;
        }

        .users-section h2 {
            display: flex;
            align-items: center;
            font-size: 1.125rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-dark);
        }

        .users-section i {
            margin-right: 0.5rem;
            color: var(--secondary-gray);
        }

        .users-table {
            background: white;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .table {
            margin: 0;
        }

        .table thead th {
            background: #f9fafb;
            border: none;
            padding: 1rem;
            font-weight: 600;
            color: var(--text-dark);
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.025em;
        }

        .table tbody td {
            padding: 1rem;
            border-color: var(--border-gray);
            vertical-align: middle;
        }

        .table tbody tr:hover {
            background-color: #f9fafb;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .user-avatar {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.875rem;
            color: white;
            flex-shrink: 0;
        }

        .user-avatar.admin { background: #dc2626; }
        .user-avatar.partner { background: #667eea; }
        .user-avatar.lawyer { background: var(--primary-blue); }
        .user-avatar.staff { background: #059669; }
        .user-avatar.client { background: #d97706; }

        .user-details h3 {
            font-size: 0.875rem;
            font-weight: 600;
            margin: 0;
            color: var(--text-dark);
        }

        .user-details p {
            font-size: 0.75rem;
            color: var(--secondary-gray);
            margin: 0;
        }

        .role-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
            text-transform: capitalize;
        }

        .role-badge.admin {
            background: #fee2e2;
            color: #dc2626;
        }
        
        .role-badge.partner {
            background: #c3ceffff;
            color: #667eea;
        }

        .role-badge.lawyer {
            background: #dbeafe;
            color: var(--primary-blue);
        }

        .role-badge.staff {
            background: #d1fae5;
            color: #059669;
        }

        .role-badge.client {
            background: #fed7aa;
            color: #d97706;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }

        .status-badge.active {
            background: #d1fae5;
            color: #059669;
        }

        .status-badge.inactive {
            background: #fee2e2;
            color: #dc2626;
        }


        @media (max-width: 768px) {
            .filters-section {
                flex-direction: column;
                align-items: stretch;
            }

            .filter-select, .search-input {
                width: 100%;
                min-width: auto;
            }

            .action-buttons {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>

<div class="main-container">
    <!-- Page Header -->
    <div class="page-header">
        <i class="bi bi-people"></i>
        <h1>User Management</h1>
    </div>
    <p class="page-subtitle">Manage system users, roles, and permissions</p>


    <!-- Statistics Cards -->
    <div class="stats-cards">
        <div class="stat-card admin">
            <div class="stat-number"><?= $totalAdmins ?></div>
            <div class="stat-label">Administrators</div>
        </div>
        <div class="stat-card partner">
            <div class="stat-number"><?= $totalPartners ?></div>
            <div class="stat-label">Partners</div>
        </div>
        <div class="stat-card lawyer">
            <div class="stat-number"><?= $totalLawyers ?></div>
            <div class="stat-label">Lawyers</div>
        </div>
        <div class="stat-card staff">
            <div class="stat-number"><?= $totalStaff ?></div>
            <div class="stat-label">Staff Members</div>
        </div>
        <div class="stat-card client">
            <div class="stat-number"><?= $totalClients ?></div>
            <div class="stat-label">Clients</div>
        </div>
    </div>

    <!-- Filters -->
    <div class="filters-section">
        <select class="filter-select" id="roleFilter">
            <option value="">All Roles</option>
            <option value="admin">Administrator</option>
            <option value="partner">Partner</option>
            <option value="lawyer">Lawyer</option>
            <option value="staff">Staff</option>
            <option value="client">Client</option>
        </select>

        <select class="filter-select" id="statusFilter">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
        </select>

        <input type="text" class="search-input" placeholder="Search users by name or email..." id="searchInput">
    </div>

    <!-- Users Table -->
    <div class="users-section">
        <h2>
            <i class="bi bi-table"></i>
            All Users
        </h2>

        <div class="users-table">
            <table class="table" id="usersTable">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Last Login</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($users as $u): ?>
                    <tr data-role="<?= htmlspecialchars($u['role']) ?>" data-status="<?= htmlspecialchars($u['status'] ?? 'active') ?>">
                        <td>
                            <div class="user-info">
                                <div class="user-avatar <?= htmlspecialchars($u['role']) ?>">
                                    <?= strtoupper(substr($u['name'] ?? $u['username'], 0, 2)) ?>
                                </div>
                                <div class="user-details">
                                    <h3><?= htmlspecialchars($u['name'] ?? $u['username']) ?></h3>
                                    <p><?= ucfirst($u['role']) ?></p>
                                </div>
                            </div>
                        </td>
                        <td><?= htmlspecialchars($u['email']) ?></td>
                        <td><span class="role-badge <?= htmlspecialchars($u['role']) ?>"><?= ucfirst($u['role']) ?></span></td>
                        <td><span class="status-badge <?= $u['status'] === 'inactive' ? 'inactive' : 'active' ?>"><?= ucfirst($u['status'] ?? 'active') ?></span></td>
                        <td>
                            <small class="text-muted">
                                <?= isset($u['last_login']) ? date('M d, Y<br>g:i A', strtotime($u['last_login'])) : 'Never' ?>
                            </small>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
</body>
</html>

<?php include __DIR__ . '/../partials/footer.php'; ?>
