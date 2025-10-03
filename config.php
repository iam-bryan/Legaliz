<?php
// Database settings
$DB_HOST = "localhost";
$DB_NAME = "u785536991_legal_case_db";
$DB_USER = "u785536991_admin";
$DB_PASS = "TbcL&SFy9p/";

// Include OpenAI API key (stored safely outside public_html)
$openai_config_path = __DIR__ . '/openai_config.php'; 
if (file_exists($openai_config_path)) {
    require_once $openai_config_path;
} else {
    die("OpenAI config file not found. Please create openai_config.php outside public_html.");
}

// If you want a global constant
if (!defined("OPENAI_API_KEY") && isset($OPENAI_API_KEY)) {
    define("OPENAI_API_KEY", $OPENAI_API_KEY);
}

try {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("DB Connection failed: " . $e->getMessage());
}

if (session_status() === PHP_SESSION_NONE) session_start();

// Auth helpers
function require_login(){ 
    if(!isset($_SESSION['user_id'])){ 
        header('Location: /login.php'); 
        exit; 
    } 
}
function is_admin(){ 
    return isset($_SESSION['role']) && $_SESSION['role']==='admin'; 
}
function is_lawyer_or_staff(){ 
    return isset($_SESSION['role']) && in_array($_SESSION['role'], ['lawyer','staff']); 
}
function is_client(){ 
    return isset($_SESSION['role']) && $_SESSION['role']==='client'; 
}

// CSRF
function csrf_token(){ 
    if (empty($_SESSION['csrf_token'])) 
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32)); 
    return $_SESSION['csrf_token']; 
}
function csrf_field(){ 
    echo '<input type="hidden" name="csrf" value="'.htmlspecialchars(csrf_token(), ENT_QUOTES).'">'; 
}
function csrf_verify(){ 
    if ($_SERVER['REQUEST_METHOD']==='POST'){ 
        $t = $_POST['csrf'] ?? ''; 
        if (!$t || !hash_equals($_SESSION['csrf_token'] ?? '', $t)){ 
            http_response_code(419); 
            die('CSRF validation failed.'); 
        } 
    } 
}

// Client helper
function current_client_id($pdo){ 
    if(!isset($_SESSION['user_id'])) return null; 
    $stmt=$pdo->prepare('SELECT id FROM clients WHERE user_id=?'); 
    $stmt->execute([$_SESSION['user_id']]); 
    $r=$stmt->fetch(); 
    return $r['id'] ?? null; 
}
?>
