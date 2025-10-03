<?php 
require_once __DIR__ . '/../partials/header.php';

if(!is_admin()){ 
    http_response_code(403); 
    die('Admins only'); 
}

$error = '';
$success = '';

$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? '';

if($_SERVER['REQUEST_METHOD'] === 'POST'){ 
    csrf_verify();

    // Validate fields
    if(!$name || !$email || !$password || !$role){
        $error = 'All fields are required.';
    } else {
        try {
            $hash = password_hash($password, PASSWORD_DEFAULT);

            // Insert user
            $stmt = $pdo->prepare('INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)'); 
            $stmt->execute([$name, $email, $hash, $role]); 

            // If client, insert into clients table
            if($role === 'client'){ 
                $uid = $pdo->lastInsertId(); 
                $stmt2 = $pdo->prepare('INSERT INTO clients (user_id,name,email) VALUES (?,?,?)'); 
                $stmt2->execute([$uid, $name, $email]); 
            }

            $success = 'User account created successfully!';
            // Redirect if you want, or show success message
             header('Location: /admin_users/list.php'); exit;

        } catch(PDOException $e){
            if($e->getCode() == 23000){ // duplicate entry
                $error = 'Email is already registered.';
            } else {
                $error = 'Database error: '.$e->getMessage();
            }
        }
    }
}
?>

<!Doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>add-user • LCM</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  <style>
    body {
      background: linear-gradient(135deg, #e3e8ffff 0%, #ffffffff 100%);
      min-height: 100vh;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
    }   
    
    .register-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .register-card {
        display: flex;
        width: 100%;
        max-width: 700px; 
        border-radius: 20px; 
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        flex-direction: column;
    }
    
    
    .form-side {
      width: 100%;
      padding: 2px 40px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      background: #fff;
    }
    
    .brand-logo {
      display: flex;
      align-items: center;
      font-size: 26px;
      font-weight: 700;
      color: #4f46e5;
      margin-bottom: 10px;
    }
    
    .brand-logo i {
      margin-right: 10px;
      font-size: 28px;
    }
    
    .welcome-text {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 5px;
    }
    
    .welcome-subtitle {
      color: #6b7280;
      margin-bottom: 15px;
      font-size: 16px;
    }
    
    .form-floating {
      margin-bottom: 10px;
    }
    
    .form-floating .form-control {
      height: 45px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .form-floating .form-control:focus {
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    
    .form-floating label {
      color: #6b7280;
      font-weight: 500;
    }
    
    
    .register-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      height: 56px;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      margin-bottom: 25px;
    }
    
    .register-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    
    .login-link {
      text-align: center;
      color: #6b7280;
    }
    
    .login-link a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }
    
    .login-link a:hover {
      color: #3730a3;
      text-decoration: underline;
    }
    
    .alert {
      border-radius: 12px;
      margin-bottom: 20px;
    }
    
    /* Decorative elements */
    .illustration-side::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 100px;
      height: 100px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      animation: float 6s ease-in-out infinite;
    }
    
    .illustration-side::after {
      content: '';
      position: absolute;
      bottom: -30px;
      left: -30px;
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      animation: float 4s ease-in-out infinite reverse;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    /* Responsive design */
    @media (max-width: 768px) {
      .register-card {
        flex-direction: column;
        margin: 20px;
      }
      
      .illustration-side {
        min-height: 200px;
        padding: 30px 20px;
      }
      
      .legal-icon {
        width: 80px;
        height: 80px;
        font-size: 32px;
        margin-bottom: 20px;
      }
      
      .illustration-title {
        font-size: 20px;
      }
      
      .form-side {
        padding: 40px 30px;
      }
      
      .welcome-text {
        font-size: 28px;
      }
    }
    
    .register-container {
      margin-top: 60px;
    }
  </style>
</head>
<body>

  <div class="register-container">
    <div class="register-card">
      <div class="form-side">
        <div class="brand-logo">
          <i class="bi bi-shield-check"></i>
          Legaliz
        </div>
        
        <div class="welcome-text">Add User</div>
        <div class="welcome-subtitle">
          User accounts are created here.
        </div>
        
        <?php if(!empty($error)): ?>
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i><?=$error?>
        </div>
        <?php endif; ?>
        
        <?php if(!empty($success)): ?>
        <div class="alert alert-success">
          <i class="bi bi-check-circle me-2"></i><?=$success?>
        </div>
        <?php endif; ?>
        
        <form method="post" novalidate>
          <?php csrf_field(); ?>
          
          <div class="form-floating">
            <input type="text" name="name" id="name" class="form-control" placeholder="Enter your full name" required value="<?= htmlspecialchars($name ?? '') ?>">
            <label for="name"><i class="bi bi-person me-2"></i>Full Name</label>
          </div>
          
          <div class="form-floating">
            <input type="email" name="email" id="email" class="form-control" placeholder="Enter your email" required value="<?= htmlspecialchars($email ?? '') ?>">
            <label for="email"><i class="bi bi-envelope me-2"></i>Email Address</label>
          </div>
          
          <div class="form-floating">
            <input type="password" name="password" id="password" class="form-control" placeholder="Create a password" required>
            <label for="password"><i class="bi bi-lock me-2"></i>Password</label>
          </div>
          
          <div class="form-floating">
              <select name="role" id="role" class="form-select" required>
                <option value="" disabled selected></option>
                <option value="admin">Admin</option>
                <option value="Partner">Partner</option>
                <option value="Lawyer">Lawyer</option>
                <option value="client">Client</option>
                <option value="staff">Staff</option>
              </select>
              <label for="role"><i class="bi bi-person-badge me-2"></i>Select User Role</label>
            </div>
          
          
          <button type="submit" class="btn btn-primary w-100 register-btn">
            Create User Account
          </button>
        </form>
        
      </div>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
