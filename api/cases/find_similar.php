<?php
/**
 * Find Similar Cases API
 * Searches for similar cases based on type, lawyer, and keywords
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Include required files
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/core.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

// Verify JWT token
$data = json_decode(file_get_contents("php://input"));
$jwt = null;

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $auth = $_SERVER['HTTP_AUTHORIZATION'];
    $jwt = str_replace('Bearer ', '', $auth);
}

if (!$jwt) {
    http_response_code(401);
    echo json_encode(['message' => 'Access denied. No token provided.']);
    exit;
}

try {
    $decoded = \Firebase\JWT\JWT::decode($jwt, new \Firebase\JWT\Key($key, 'HS256'));
    $user_id = $decoded->data->id;
    $user_role = $decoded->data->role;
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['message' => 'Access denied. Invalid token.']);
    exit;
}

// Get parameters
$case_id = isset($data->case_id) ? intval($data->case_id) : 0;
$case_type_id = isset($data->case_type_id) ? intval($data->case_type_id) : 0;
$limit = isset($data->limit) ? intval($data->limit) : 5;

if ($case_id <= 0 || $case_type_id <= 0) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid case ID or case type']);
    exit;
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Find similar cases based on:
    // 1. Same case type
    // 2. Same assigned lawyer (if lawyer role)
    // 3. Exclude current case
    // 4. Order by most recent first
    
    $query = "SELECT 
                c.id,
                c.title,
                c.description,
                c.status,
                c.progress,
                ct.name as case_type,
                cl.first_name as client_first_name,
                cl.last_name as client_last_name,
                c.created_at,
                c.updated_at
              FROM cases c
              LEFT JOIN case_types ct ON c.case_type_id = ct.id
              LEFT JOIN clients cl ON c.client_id = cl.id
              WHERE c.case_type_id = :case_type_id
                AND c.id != :case_id";
    
    // If lawyer, only show their own cases for privacy
    if ($user_role === 'lawyer') {
        $query .= " AND c.assigned_lawyer_id = :user_id";
    }
    
    $query .= " ORDER BY c.updated_at DESC
                LIMIT :limit";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':case_type_id', $case_type_id);
    $stmt->bindParam(':case_id', $case_id);
    
    if ($user_role === 'lawyer') {
        $stmt->bindParam(':user_id', $user_id);
    }
    
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $similar_cases = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format response
    $response = [
        'similar_cases' => array_map(function($case) {
            return [
                'id' => intval($case['id']),
                'title' => $case['title'],
                'description' => $case['description'],
                'case_type' => $case['case_type'],
                'status' => $case['status'],
                'progress' => intval($case['progress']),
                'client_name' => $case['client_first_name'] . ' ' . $case['client_last_name'],
                'created_at' => $case['created_at'],
                'updated_at' => $case['updated_at']
            ];
        }, $similar_cases),
        'count' => count($similar_cases)
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Database error occurred',
        'error' => $e->getMessage()
    ]);
}
