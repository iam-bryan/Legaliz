<?php 
require_once __DIR__ . '/config.php'; 
require_login();
$role = $_SESSION['role'] ?? 'client';
if ($role === 'admin') {
    include __DIR__ . '/dashboard_admin.php';
} elseif ($role === 'lawyer') {
    include __DIR__ . '/dashboard_lawyer.php';
} elseif ($role === 'staff') {
    include __DIR__ . '/dashboard_staff.php';
} elseif ($role === 'partner') {
    include __DIR__ . '/dashboard_partner.php';
} else {
    include __DIR__ . '/dashboard_client.php';
}