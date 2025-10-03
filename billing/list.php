<?php 
session_start();
require_once __DIR__ . '/../partials/header.php'; 
?>

<?php if (!empty($_GET['success'])): ?>
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i><?= htmlspecialchars($_GET['success']) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<?php endif; ?>

<?php if (!empty($_GET['error'])): ?>
    <div class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i><?= htmlspecialchars($_GET['error']) ?>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<?php endif; ?>



<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <!-- Header Section -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="text-primary">
                    <i class="fas fa-file-invoice-dollar me-2"></i>
                    Billing & Invoices
                </h3>
                
                <?php if ($_SESSION['role'] !== 'client'): ?>
                    <a href="/billing/add.php" class="btn btn-primary">
                        <i class="fas fa-plus me-1"></i>Create Invoice
                    </a>
                <?php endif; ?>
            </div>

            <!-- Summary Cards -->
            <div class="row mb-4">
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-primary">
                        <div class="card-body text-center">
                            <i class="fas fa-file-invoice fa-2x text-primary mb-2"></i>
                            <h5 class="card-title text-primary"><?= number_format($stats['total_invoices']) ?></h5>
                            <p class="card-text text-muted">Total Invoices</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-success">
                        <div class="card-body text-center">
                            <i class="fas fa-check-circle fa-2x text-success mb-2"></i>
                            <h5 class="card-title text-success">₱<?= number_format((float)$stats['paid_amount'], 2) ?></h5>
                            <p class="card-text text-muted">Paid Amount</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-warning">
                        <div class="card-body text-center">
                            <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                            <h5 class="card-title text-warning">₱<?= number_format((float)$stats['unpaid_amount'], 2) ?></h5>
                            <p class="card-text text-muted">Unpaid Amount</p>
                        </div>
                    </div>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                    <div class="card border-danger">
                        <div class="card-body text-center">
                            <i class="fas fa-exclamation-triangle fa-2x text-danger mb-2"></i>
                            <h5 class="card-title text-danger">₱<?= number_format((float)$stats['overdue_amount'], 2) ?></h5>
                            <p class="card-text text-muted">Overdue Amount</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Filters and Search -->
            <div class="card mb-4">
                <div class="card-body">
                    <form method="GET" class="row g-3">
                        <div class="col-md-4">
                            <label for="search" class="form-label">Search</label>
                            <input type="text" name="search" id="search" class="form-control" 
                                   placeholder="Search by case, client, invoice #..." 
                                   value="<?= htmlspecialchars($search) ?>">
                        </div>
                        <div class="col-md-3">
                            <label for="status" class="form-label">Status Filter</label>
                            <select name="status" id="status" class="form-select">
                                <option value="">All Statuses</option>
                                <option value="unpaid" <?= $status_filter === 'unpaid' ? 'selected' : '' ?>>Unpaid</option>
                                <option value="paid" <?= $status_filter === 'paid' ? 'selected' : '' ?>>Paid</option>
                                <option value="overdue" <?= $status_filter === 'overdue' ? 'selected' : '' ?>>Overdue</option>
                            </select>
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <div class="btn-group" role="group">
                                <button type="submit" class="btn btn-primary">Filter</button>
                                <a href="/billing/list.php" class="btn btn-outline-secondary">Clear</a>
                            </div>
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <small class="text-muted">
                                Showing <?= count($invoices) ?> of <?= $total ?> records
                            </small>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Invoices Table -->
            <div class="card">
                <div class="card-header">
                    <h5 class="card-title mb-0">Invoice List</h5>
                </div>
                <div class="card-body">
                    <?php if (empty($invoices)): ?>
                        <div class="text-center py-5">
                            <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No invoices found</h5>
                            <?php if ($_SESSION['role'] !== 'client'): ?>
                                <p><a href="/billing/add.php" class="btn btn-primary">Create your first invoice</a></p>
                            <?php else: ?>
                                <p class="text-muted">No invoices have been created for your cases yet.</p>
                            <?php endif; ?>
                        </div>
                    <?php else: ?>
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Case</th>
                                        <?php if ($_SESSION['role'] !== 'client'): ?>
                                            <th>Client</th>
                                        <?php endif; ?>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($invoices as $invoice): ?>
                                        <tr>
                                            <td>
                                                <strong><?= htmlspecialchars($invoice['invoice_number']) ?></strong>
                                            </td>
                                            <td>
                                                <?= htmlspecialchars($invoice['case_title']) ?><br>
                                                <small class="text-muted">Case #<?= $invoice['case_id'] ?></small>
                                            </td>
                                            <?php if ($_SESSION['role'] !== 'client'): ?>
                                                <td>
                                                    <?= htmlspecialchars($invoice['client_name'] ?: 'N/A') ?>
                                                    <?php if ($invoice['lawyer_name']): ?>
                                                        <br><small class="text-muted"><?= htmlspecialchars($invoice['lawyer_name']) ?></small>
                                                    <?php endif; ?>
                                                </td>
                                            <?php endif; ?>
                                            <td>
                                                <strong>₱<?= number_format((float)$invoice['amount'], 2) ?></strong>
                                            </td>
                                            <td>
                                                <?php
                                                $status_class = 'secondary';
                                                switch ($invoice['status']) {
                                                    case 'paid': $status_class = 'success'; break;
                                                    case 'unpaid': $status_class = 'warning'; break;
                                                    case 'overdue': $status_class = 'danger'; break;
                                                }
                                                ?>
                                                <span class="badge bg-<?= $status_class ?>">
                                                    <?= ucfirst(htmlspecialchars($invoice['status'])) ?>
                                                </span>
                                            </td>
                                            <td>
                                                <?= date('M j, Y', strtotime($invoice['issued_at'])) ?><br>
                                                <small class="text-muted"><?= date('g:i A', strtotime($invoice['issued_at'])) ?></small>
                                            </td>
                                            <td>
                                                <a href="/billing/invoice_pdf.php?id=<?= $invoice['id'] ?>" 
                                                   class="btn btn-sm btn-outline-primary" 
                                                   target="_blank"
                                                   title="Download PDF">
                                                    <i class="fas fa-file-pdf"></i> PDF
                                                </a>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Pagination -->
            <?php if ($total_pages > 1): ?>
                <nav class="mt-4">
                    <ul class="pagination justify-content-center">
                        <li class="page-item <?= $page <= 1 ? 'disabled' : '' ?>">
                            <a class="page-link" href="?page=<?= max(1, $page - 1) ?><?= $search ? '&search=' . urlencode($search) : '' ?><?= $status_filter ? '&status=' . urlencode($status_filter) : '' ?>">
                                Previous
                            </a>
                        </li>
                        
                        <?php for ($i = max(1, $page - 2); $i <= min($total_pages, $page + 2); $i++): ?>
                            <li class="page-item <?= $i == $page ? 'active' : '' ?>">
                                <a class="page-link" href="?page=<?= $i ?><?= $search ? '&search=' . urlencode($search) : '' ?><?= $status_filter ? '&status=' . urlencode($status_filter) : '' ?>">
                                    <?= $i ?>
                                </a>
                            </li>
                        <?php endfor; ?>
                        
                        <li class="page-item <?= $page >= $total_pages ? 'disabled' : '' ?>">
                            <a class="page-link" href="?page=<?= min($total_pages, $page + 1) ?><?= $search ? '&search=' . urlencode($search) : '' ?><?= $status_filter ? '&status=' . urlencode($status_filter) : '' ?>">
                                Next
                            </a>
                        </li>
                    </ul>
                </nav>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Debug information (remove in production) -->
<div class="mt-4 p-3 bg-light border rounded" style="font-size: 0.8em;">
    <strong>Debug Info:</strong><br>
    Total Records: <?= $total ?><br>
    Current Page: <?= $page ?><br>
    Records on Page: <?= count($invoices) ?><br>
    Where Clause: <?= htmlspecialchars($where_clause ?: 'None') ?><br>
    Search: <?= htmlspecialchars($search ?: 'None') ?><br>
    Status Filter: <?= htmlspecialchars($status_filter ?: 'None') ?>
</div>

<?php require_once __DIR__ . '/../partials/footer.php'; ?>