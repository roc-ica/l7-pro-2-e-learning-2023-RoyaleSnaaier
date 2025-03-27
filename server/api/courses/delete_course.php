<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

// Allow both DELETE and POST for flexibility
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'error' => 'Method not allowed']);
    exit;
}

// Parse input data based on request method
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    parse_str(file_get_contents('php://input'), $data);
} else {
    $data = json_decode(file_get_contents('php://input'), true);
}

// Validate required parameters
$courseId = $data['course_id'] ?? null;
$userId = $data['user_id'] ?? null;

if (!$courseId || !$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Course ID and User ID are required']);
    exit;
}

try {
    $conn->beginTransaction();
    
    // Check if user is the creator of the course
    $stmt = $conn->prepare("SELECT creator_id FROM courses WHERE course_id = ?");
    $stmt->execute([$courseId]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$course) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Course not found']);
        exit;
    }
    
    if ($course['creator_id'] != $userId) {
        $conn->rollBack();
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to delete this course']);
        exit;
    }
    
    // Option 1: Actually delete the course and all related data (cascade delete)
    // - This would require careful setup of CASCADE DELETE in the database
    
    // Option 2: Soft delete by setting status to archived
    $stmt = $conn->prepare("UPDATE courses SET status = 'archived' WHERE course_id = ?");
    $stmt->execute([$courseId]);
    
    $conn->commit();
    echo json_encode([
        'status' => 'success',
        'message' => 'Course archived successfully'
    ]);
} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
