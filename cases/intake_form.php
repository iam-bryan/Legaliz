<?php 
require_once __DIR__ . '/../config.php'; 
require_login(); 
include __DIR__ . '/../partials/header.php'; 
?>

<h2 class="mb-4">New Case Intake Form</h2>

<div class="card shadow-sm border-0">
  <div class="card-body">
    <form method="POST" action="intake_process.php">
      <div class="mb-3">
        <label class="form-label">Case Title</label>
        <input type="text" name="case_title" class="form-control" required>
      </div>
      <div class="mb-3">
        <label class="form-label">Case Description</label>
        <textarea name="case_description" rows="3" class="form-control" required></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Preferred Lawyer</label>
        <input type="text" name="lawyer" class="form-control">
      </div>
      <div class="mb-3">
        <label class="form-label">Urgency</label>
        <select name="urgency" class="form-select">
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary">Submit Case</button>
    </form>
  </div>
</div>

<?php include __DIR__ . '/../partials/footer.php'; ?>
