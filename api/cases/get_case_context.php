<?php
/**
 * Get Case Context API
 * Returns case details, documents, and client info for AI context
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
    exit;
}

// Verify JWT token
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

// Get case_id from query parameter
$case_id = isset($_GET['case_id']) ? intval($_GET['case_id']) : 0;

if ($case_id <= 0) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid case ID']);
    exit;
}

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

try {
    // Fetch case details with client information
    $query = "SELECT 
                c.id,
                c.title,
                c.description,
                c.case_type_id,
                ct.name as case_type,
                c.status,
                c.progress,
                c.client_id,
                c.assigned_lawyer_id,
                cl.first_name as client_first_name,
                cl.last_name as client_last_name,
                cl.email as client_email,
                u.first_name as lawyer_first_name,
                u.last_name as lawyer_last_name,
                c.created_at,
                c.updated_at
              FROM cases c
              LEFT JOIN case_types ct ON c.case_type_id = ct.id
              LEFT JOIN clients cl ON c.client_id = cl.id
              LEFT JOIN users u ON c.assigned_lawyer_id = u.id
              WHERE c.id = :case_id";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':case_id', $case_id);
    $stmt->execute();
    
    $case = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$case) {
        http_response_code(404);
        echo json_encode(['message' => 'Case not found']);
        exit;
    }
    
    // Check access permissions
    // Lawyers can only see their assigned cases, clients can only see their own cases
    if ($user_role === 'lawyer' && $case['assigned_lawyer_id'] != $user_id) {
        http_response_code(403);
        echo json_encode(['message' => 'Access denied. Not your assigned case.']);
        exit;
    }
    
    if ($user_role === 'client' && $case['client_id'] != $user_id) {
        http_response_code(403);
        echo json_encode(['message' => 'Access denied. Not your case.']);
        exit;
    }
    
    // Fetch documents for this case
    $doc_query = "SELECT 
                    id,
                    file_name,
                    file_path,
                    file_size,
                    uploaded_at
                  FROM documents
                  WHERE case_id = :case_id
                  ORDER BY uploaded_at DESC";
    
    $doc_stmt = $db->prepare($doc_query);
    $doc_stmt->bindParam(':case_id', $case_id);
    $doc_stmt->execute();
    
    $documents = $doc_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format response
    $response = [
        'case' => [
            'id' => intval($case['id']),
            'title' => $case['title'],
            'description' => $case['description'],
            'case_type_id' => intval($case['case_type_id']),
            'case_type' => $case['case_type'],
            'status' => $case['status'],
            'progress' => intval($case['progress']),
            'client_name' => $case['client_first_name'] . ' ' . $case['client_last_name'],
            'client_email' => $case['client_email'],
            'lawyer_name' => $case['lawyer_first_name'] . ' ' . $case['lawyer_last_name'],
            'created_at' => $case['created_at'],
            'updated_at' => $case['updated_at']
        ],
        'documents' => array_map(function($doc) {
            return [
                'id' => intval($doc['id']),
                'file_name' => $doc['file_name'],
                'file_path' => $doc['file_path'],
                'file_size' => intval($doc['file_size']),
                'uploaded_at' => $doc['uploaded_at']
            ];
        }, $documents),
        'document_count' => count($documents)
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
