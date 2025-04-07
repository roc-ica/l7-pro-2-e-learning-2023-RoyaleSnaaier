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
$lessonId = $data['lesson_id'] ?? null;
$userId = $data['user_id'] ?? null;

if (!$lessonId || !$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Lesson ID and User ID are required']);
    exit;
}

try {
    $conn->beginTransaction();
    
    // Check if user is the creator of the course that contains this lesson
    $stmt = $conn->prepare("
        SELECT c.creator_id, l.course_id, l.order_number
        FROM lessons l
        JOIN courses c ON l.course_id = c.course_id
        WHERE l.lesson_id = ?
    ");
    $stmt->execute([$lessonId]);
    $lesson = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$lesson) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Lesson not found']);
        exit;
    }
    
    if ($lesson['creator_id'] != $userId) {
        $conn->rollBack();
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to delete this lesson']);
        exit;
    }
    
    // Option 1: Permanently delete the lesson and all related data
    // This will cascade delete exercises and exercise options
    $stmt = $conn->prepare("DELETE FROM lessons WHERE lesson_id = ?");
    $stmt->execute([$lessonId]);
    
    // Update order numbers of remaining lessons in this course
    $stmt = $conn->prepare("
        UPDATE lessons 
        SET order_number = order_number - 1 
        WHERE course_id = ? AND order_number > ?
    ");
    $stmt->execute([$lesson['course_id'], $lesson['order_number']]);
    
    $conn->commit();
    echo json_encode([
        'status' => 'success',
        'message' => 'Lesson deleted successfully'
    ]);
} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
