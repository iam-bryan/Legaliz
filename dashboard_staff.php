<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'staff') {
    header("Location: login.php");
    exit();
}
include 'partials/header.php';
?>

<div class="container mt-4">
    <h2>Welcome, Staff!</h2>
    <p>This is your Staff Dashboard. You have access to viewing and scheduling features.</p>

    <!-- Summary Cards -->
    <div class="row g-4 mb-4">
        <!-- Total Schedules -->
        <div class="col-md-4">
            <div class="card shadow-sm border-0 text-center">
                <div class="card-body">
                    <h6 class="text-secondary">Total Schedules</h6>
                    <h3 class="fw-bold">5</h3> <!-- Replace with PHP count query -->
                    <i class="bi bi-calendar-check fs-1 text-primary mb-3"></i>
                    <a href="schedules/list.php" class="btn btn-primary w-100">View Schedules</a>
                </div>
            </div>
        </div>

        <!-- Upcoming Schedules -->
        <div class="col-md-4">
            <div class="card shadow-sm border-0 text-center">
                <div class="card-body">
                    <h6 class="text-secondary">Upcoming Schedules</h6>
                    <h3 class="fw-bold">2</h3> <!-- Replace with PHP count query -->
                    <i class="bi bi-clock-history fs-1 text-success mb-3"></i>
                    <a href="schedules/list.php" class="btn btn-success w-100">View Upcoming</a>
                </div>
            </div>
        </div>

        <!-- Set a Schedule -->
        <div class="col-md-4">
            <div class="card shadow-sm border-0 text-center">
                <div class="card-body">
                    <h6 class="text-secondary">Create New</h6>
                    <h3 class="fw-bold">+</h3>
                    <i class="bi bi-plus-circle fs-1 text-warning mb-3"></i>
                    <a href="schedules/add_sched.php" class="btn btn-warning w-100">Set a Schedule</a>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include 'partials/footer.php'; ?>
