<?php
session_start(); 
require_once __DIR__ . '/config.php'; 

$error = '';
$success = '';

if($_SERVER['REQUEST_METHOD'] === 'POST') { 
    csrf_verify();

    $name = trim($_POST['name'] ?? '');
    $email = strtolower(trim($_POST['email'] ?? ''));
    $pwd = $_POST['password'] ?? '';

    if(!$name || !$email || !$pwd) {
        $error = 'All fields required.';
    } else {
        $hash = password_hash($pwd, PASSWORD_DEFAULT);

        try {
            $stmt = $pdo->prepare('INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)');
            $stmt->execute([$name, $email, $hash, 'client']);

            $uid = $pdo->lastInsertId();

            header('Location: /login.php?registered=1');
            exit;

        }  catch(PDOException $e) {
            // Check which unique constraint was violated
            if($e->getCode() == 23000) {
                $errorInfo = $e->errorInfo; // array: [SQLSTATE, driverCode, driverMessage]
                $msg = strtolower($errorInfo[2]); // the driver error message

                if(strpos($msg, 'username') !== false) {
                    $error = 'Username is already used.';
                } elseif(strpos($msg, 'email') !== false) {
                    $error = 'Email is already used.';
                } else {
                    $error = 'Email or Username already used.';
                }
            } else {
                $error = 'Registration failed: ' . $e->getMessage();
            }
        }
    }
}
?>


<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Register • LCM</title>
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
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
    }
    
    .register-card {
        display: flex;
        width: 100%;
        height: 85vh; 
        max-width: 800px; 
        border-radius: 20px; 
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    
    
    .form-side {
      width: 100%;
      padding: 40px 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: #fff;
    }
    
    .brand-logo {
      display: flex;
      align-items: center;
      font-size: 24px;
      font-weight: 700;
      color: #4f46e5;
      margin-bottom: 30px;
    }
    
    .brand-logo i {
      margin-right: 10px;
      font-size: 28px;
    }
    
    .welcome-text {
      font-size: 30px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 5px;
    }
    
    .welcome-subtitle {
      color: #6b7280;
      margin-bottom: 25px;
      font-size: 16px;
    }
    
    .form-floating {
      margin-bottom: 20px;
    }
    
    .form-floating .form-control {
      height: 56px;
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
        
        <div class="welcome-text">Create Account</div>
        <div class="welcome-subtitle">
          Client accounts are created here.
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
          
          
          <button type="submit" class="btn btn-primary w-100 register-btn">
            Create Account
          </button>
        </form>
        
        <div class="login-link">
          Already have an account? <a href="/login.php">Sign In</a>
        </div>
      </div>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>