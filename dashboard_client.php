<?php 
require_once __DIR__ . '/config.php'; 
require_login(); 
include __DIR__ . '/partials/header.php'; 
?>

<h2 class="mb-4">Client Dashboard</h2>

<div class="row g-4">
  <!-- My Cases -->
  <div class="col-md-4">
    <div class="card p-3 shadow-sm border-0 stat">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="text-secondary">My</div>
          <div class="h3">Cases</div>
        </div>
        <i class="bi bi-folder2 fs-1 text-primary"></i>
      </div>
      <a href="/cases/list.php" class="btn btn-outline-primary w-100 mt-3">View My Cases</a>
    </div>
  </div>

  <!-- Billing Invoices -->
  <div class="col-md-4">
    <div class="card p-3 shadow-sm border-0 stat">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="text-secondary">Billing</div>
          <div class="h3">Invoices</div>
        </div>
        <i class="bi bi-receipt fs-1 text-success"></i>
      </div>
      <a href="/billing/list.php" class="btn btn-outline-success w-100 mt-3">My Invoices</a>
    </div>
  </div>

  <!-- Help AI Lookup -->
  <div class="col-md-4">
    <div class="card p-3 shadow-sm border-0 stat">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <div class="text-secondary">Help</div>
          <div class="h3">AI Lookup</div>
        </div>
        <i class="bi bi-robot fs-1 text-warning"></i>
      </div>
      <a href="/ai_lookup.php" class="btn btn-outline-warning w-100 mt-3">Ask AI</a>
    </div>
  </div>
</div>

<!-- Second Row: Recent Cases + Recent Activity -->
<div class="row g-4 mt-3">
  <!-- Recent Cases -->
  <div class="col-lg-8">
    <div class="card shadow-sm border-0">
      <div class="card-header bg-white">
        <h5 class="mb-0">Recent Cases</h5>
      </div>
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Case A – Hearing on Sept 10</li>
          <li class="list-group-item">Case B – Pending Documents</li>
          <li class="list-group-item">Case C – Resolved</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="col-lg-4">
    <div class="card shadow-sm border-0 mb-3">
      <div class="card-header bg-white">
        <h5 class="mb-0">Recent Invoices</h5>
      </div>
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">Invoice #001 – Paid</li>
          <li class="list-group-item">Invoice #002 – Due Aug 30</li>
        </ul>
      </div>
    </div>

<div class="card shadow-sm border-0">
  <div class="card-header">Recent Cases</div>
  <div class="card-body">
    <ul class="list-group">
      <li class="list-group-item">Case 1: Contract Dispute</li>
      <li class="list-group-item">Case 2: Property Claim</li>
      <li class="list-group-item">Case 3: Personal Injury</li>
    </ul>

    <!-- Button for creating intake form -->
    <a href="/cases/intake_form.php" class="btn btn-outline-primary w-100 mt-3">
      <i class="bi bi-file-earmark-plus me-1"></i> Create Intake Form
        </a>
      </div>
    </div>


    <div class="card shadow-sm border-0">
      <div class="card-header bg-white">
        <h5 class="mb-0">AI Lookup History</h5>
      </div>
      <div class="card-body">
        <ul class="list-group list-group-flush">
          <li class="list-group-item">“What is my next hearing date?”</li>
          <li class="list-group-item">“Explain contract clause…”</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<?php include __DIR__ . '/partials/footer.php'; ?>
