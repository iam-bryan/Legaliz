<?php
session_start();
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $inv = 'INV-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

    try {
        $stmt = $pdo->prepare('INSERT INTO billing (case_id, amount, description, status, invoice_number, pdf_path) VALUES (?,?,?,?,?,?)');
        $stmt->execute([
            $_POST['case_id'],
            $_POST['amount'],
            $_POST['description'],
            $_POST['status'],
            $inv,
            NULL
        ]);

        header('Location: /billing/list.php?success=Invoice created successfully');
        exit;
    } catch (Exception $e) {
        header('Location: /billing/list.php?error=Failed to create invoice');
        exit;
    }
}

// Fetch cases AFTER logic
$cases = $pdo->query('SELECT id, title FROM cases ORDER BY id DESC')->fetchAll();

require_once __DIR__ . '/../partials/header.php';
?>


<div class="container-fluid">
    <div class="row">
        <div class="col-md-8 offset-md-2">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="text-primary">
                    <i class="fas fa-file-invoice-dollar me-2"></i>Create Invoice
                </h2>
                <a href="/billing/list.php" class="btn btn-outline-secondary">
                    <i class="fas fa-arrow-left me-1"></i>Back to Billing
                </a>
            </div>

            <?php if ($success): ?>
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    <i class="fas fa-check-circle me-2"></i><?= htmlspecialchars($success) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <?php if ($error): ?>
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    <i class="fas fa-exclamation-triangle me-2"></i><?= htmlspecialchars($error) ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <div class="card shadow-sm">
                <div class="card-header bg-light">
                    <h5 class="card-title mb-0">
                        <i class="fas fa-plus-circle me-2 text-primary"></i>Invoice Details
                    </h5>
                </div>
                <div class="card-body">
                    <form method="post" class="needs-validation" novalidate>
                        <?php csrf_field(); ?>
                        
                        <div class="row">
                            <!-- Case Dropdown -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="case_id" class="form-label">
                                        <i class="fas fa-briefcase me-1"></i>Select Case *
                                    </label>
                                    <select name="case_id" id="case_id" class="form-select" required>
                                        <option value="">Choose a case...</option>
                                        <?php foreach ($cases as $case): ?>
                                            <option value="<?= $case['id'] ?>" 
                                                <?= (isset($_POST['case_id']) && $_POST['case_id'] == $case['id']) ? 'selected' : '' ?>>
                                                <?= htmlspecialchars($case['title']) ?>
                                                <?php if ($case['client_name']): ?>
                                                    - (<?= htmlspecialchars($case['client_name']) ?>)
                                                <?php endif; ?>
                                            </option>
                                        <?php endforeach; ?>
                                    </select>
                                    <div class="invalid-feedback">
                                        Please select a case.
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Amount Input -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="amount" class="form-label">
                                        <i class="fas fa-peso-sign me-1"></i>Amount *
                                    </label>
                                    <div class="input-group">
                                        <span class="input-group-text">₱</span>
                                        <input type="number" name="amount" id="amount" class="form-control"
                                            step="0.01" min="0.01" placeholder="0.00"
                                            value="<?= htmlspecialchars($_POST['amount'] ?? '') ?>" required>
                                        <div class="invalid-feedback">
                                            Please enter a valid amount.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="mb-3">
                            <label for="description" class="form-label">
                                <i class="fas fa-align-left me-1"></i>Description *
                            </label>
                            <textarea name="description" id="description" class="form-control" rows="4" 
                                placeholder="Detailed description of services provided..." required><?= htmlspecialchars($_POST['description'] ?? '') ?></textarea>
                            <div class="invalid-feedback">
                                Please provide a description.
                            </div>
                        </div>

                        <div class="row">
                            <!-- Status -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="status" class="form-label">
                                        <i class="fas fa-flag me-1"></i>Status
                                    </label>
                                    <select name="status" id="status" class="form-select">
                                        <option value="unpaid" <?= (isset($_POST['status']) && $_POST['status'] === 'unpaid') ? 'selected' : '' ?>>Unpaid</option>
                                        <option value="paid" <?= (isset($_POST['status']) && $_POST['status'] === 'paid') ? 'selected' : '' ?>>Paid</option>
                                        <option value="overdue" <?= (isset($_POST['status']) && $_POST['status'] === 'overdue') ? 'selected' : '' ?>>Overdue</option>
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Invoice Number -->
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">
                                        <i class="fas fa-hashtag me-1"></i>Invoice Number
                                    </label>
                                    <input type="text" class="form-control" readonly 
                                        placeholder="Auto-generated on save" 
                                        style="background-color: #f8f9fa;">
                                    <small class="text-muted">Will be generated automatically</small>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between pt-3 border-top">
                            <a href="/billing/list.php" class="btn btn-outline-secondary">
                                <i class="fas fa-times me-1"></i>Cancel
                            </a>
                            <button type="submit" class="btn btn-primary px-4">
                                <i class="fas fa-save me-1"></i>Create Invoice
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Format amount on blur
document.getElementById('amount').addEventListener('blur', function() {
    let value = parseFloat(this.value);
    if (!isNaN(value)) {
        this.value = value.toFixed(2);
    }
});

// Bootstrap validation
(function () {
    'use strict';
    const forms = document.querySelectorAll('.needs-validation');
    Array.prototype.slice.call(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
})();
</script>

<?php require_once __DIR__ . '/../partials/footer.php'; ?>
