<?php require_once __DIR__ . '/config.php'; ?>
<?php
if(isset($_SESSION['user_id'])){ header('Location: /dashboard.php'); exit; }
if($_SERVER['REQUEST_METHOD']==='POST'){ csrf_verify();
  $email = trim($_POST['email'] ?? ''); $pass = $_POST['password'] ?? '';
  $stmt = $pdo->prepare('SELECT * FROM users WHERE email=?'); $stmt->execute([$email]); $user = $stmt->fetch();
  if($user && password_verify($pass, $user['password'])){
    $_SESSION['user_id']=$user['id']; $_SESSION['name']=$user['username'] ?? $user['name'] ?? 'User'; $_SESSION['role']=$user['role'];
    header('Location: /dashboard.php'); exit;
  } else { $error = 'Invalid credentials.'; }
}
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Login • LCM</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
  
  <style>
  body {
    background: linear-gradient(135deg, #e3e8ff 0%, #ffffff 100%);
    min-height: 100vh;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }
  
  html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      /* removed overflow:hidden to allow mobile scrolling */
  }   
  
    .login-container {
        width: 70%;              
        max-width: 1200px;      
        margin: 50px auto;       
        display: flex;           
        align-items: center;     
        border-radius: 15px;
        box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        background: #fff;
        overflow: hidden;
    }
      
  .login-card {
      display: flex;
      width: 100%;
      height: auto; /* allow natural height on smaller screens */
      max-width: 1200px; 
      border-radius: 20px; 
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
  }
  
  .illustration-side {
    width: 70%;
    background: linear-gradient(135deg, #e4fffa 0%, #ebefff 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
    position: relative;
  }
  
  .illustration-content {
    text-align: center;
    color: white;
  }
  
  .legal-icon {
    width: 120px;
    height: 120px;
    margin: 0 auto 30px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .illustration-title {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 15px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .illustration-subtitle {
    font-size: 16px;
    opacity: 0.9;
    line-height: 1.6;
  }
  
  .form-side {
    width: 50%;
    padding: 50px 40px;
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
    margin-bottom: 40px;
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
    margin-bottom: 5px;
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
  
  .remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }
  
  .form-check-input:checked {
    background-color: #4f46e5;
    border-color: #4f46e5;
  }
  
  .forgot-link {
    color: #4f46e5;
    text-decoration: none;
    font-size: 14px;
  }
  
  .forgot-link:hover {
    color: #3730a3;
    text-decoration: underline;
  }
  
  .login-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 12px;
    height: 56px;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    margin-bottom: 30px;
  }
  
  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
  
  .create-account {
    text-align: center;
    color: #6b7280;
  }
  
  .create-account a {
    color: #4f46e5;
    text-decoration: none;
    font-weight: 600;
  }
  
  .create-account a:hover {
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
    .login-card {
      flex-direction: column;
      height: auto;
      margin: 20px;
    }
    
    .illustration-side {
      width: 100%;
      min-height: 200px;
      padding: 30px 20px;
    }
    
    .form-side {
      width: 100%;
      padding: 40px 20px;
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
    
    .welcome-text {
      font-size: 26px;
    }
  }
  
  @media (max-width: 576px) {
    .form-side {
      padding: 30px 15px;
    }
    .welcome-text {
      font-size: 22px;
    }
    .welcome-subtitle {
      font-size: 14px;
    }
    .login-btn {
      font-size: 14px;
      height: 50px;
    }
    .login-container {
        width: 95%;         /* Use more width on smaller screens */
        flex-direction: column; /* Stack logo above form */
    }

    .login-container img {
        max-width: 80%;
        margin: 20px auto;
    }
}
  }
</style>


</head>
<body>

  <div class="login-container">
    <div class="login-card">
      <!-- Left side - Illustration -->
      <div class="illustration-side">
        <div class="illustration-content">
          <div class="legal-icon">
            <img src="https://www.pngkey.com/png/full/214-2142812_law-logo-png-lawyer.png" 
                 alt="Legal Logo" 
                 style="width: 300px; height: auto;">
          </div>
        </div>
      </div>
      
      <!-- Right side - Login Form -->
      <div class="form-side">
        <div class="brand-logo">
          <i class="bi bi-shield-check"></i>
          Legaliz
        </div>
        
        <div class="welcome-text">Welcome!</div>
        <div class="welcome-subtitle">
          Please login with your email address and password.
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
            <input type="email" name="email" id="email" class="form-control" placeholder="Enter your email" required value="<?= htmlspecialchars($email ?? '') ?>">
            <label for="email"><i class="bi bi-envelope me-2"></i>Email Address</label>
          </div>
          
          <div class="form-floating">
            <input type="password" name="password" id="password" class="form-control" placeholder="Enter your password" required>
            <label for="password"><i class="bi bi-lock me-2"></i>Password</label>
          </div>
          
          <div class="remember-forgot">
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="remember">
              <label class="form-check-label" for="remember">
                Remember Me
              </label>
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary w-100 login-btn">
            Login Now
          </button>
        </form>
        
        <div class="create-account">
          Don't have an account? <a href="/register.php">Create Account</a>
        </div>
      </div>
    </div>
  </div>
  
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>