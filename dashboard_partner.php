<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'partner') {
    header("Location: login.php");
    exit();
}
include 'partials/header.php';
?>

<!-- Main Content -->
<h2 class="mt-4 mb-4">Partner Dashboard</h2>

  <!-- Summary Cards -->
  <div class="row g-4 mb-4">
    <!-- Active Cases -->
    <div class="col-md-4">
      <div class="card shadow-sm border-0">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 class="text-secondary">My Cases</h6>
            <h3 class="fw-bold">4</h3> <!-- Replace with PHP count query -->
          </div>
          <i class="bi bi-briefcase fs-1 text-primary"></i>
        </div>
      </div>
    </div>

    <!-- Total Clients -->
    <div class="col-md-4">
      <div class="card shadow-sm border-0">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 class="text-secondary">Total Clients</h6>
            <h3 class="fw-bold">2</h3> <!-- Replace with PHP count query -->
          </div>
          <i class="bi bi-people fs-1 text-success"></i>
        </div>
      </div>
    </div>

    <!-- Court Schedule -->
    <div class="col-md-4">
      <div class="card shadow-sm border-0">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <h6 class="text-secondary">Upcoming Hearings</h6>
            <h3 class="fw-bold">3</h3> <!-- Replace with PHP count query -->
          </div>
          <i class="bi bi-calendar-event fs-1 text-warning"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent Cases Table -->
  <div class="card shadow-sm border-0">
    <div class="card-header bg-white">
      <h5 class="mb-0">Recent Cases</h5>
    </div>
    <div class="card-body">
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Client</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            <!-- Replace with dynamic PHP query -->
            <tr>
              <td>#1023</td>
              <td>John Doe</td>
              <td><span class="badge bg-primary">Active</span></td>
              <td>2025-08-20</td>
            </tr>
            <tr>
              <td>#1019</td>
              <td>Jane Smith</td>
              <td><span class="badge bg-success">Closed</span></td>
              <td>2025-08-15</td>
            </tr>
            <tr>
              <td>#1015</td>
              <td>Michael Lee</td>
              <td><span class="badge bg-warning">Pending</span></td>
              <td>2025-08-10</td>
            </tr>
          </tbody>
        </table>
      </div>
      <a href="/cases/list.php" class="btn btn-outline-primary mt-3">View All Cases</a>
    </div>
  </div>

</main>
</div>
</div>


<?php include 'partials/footer.php'; ?>
