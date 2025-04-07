<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

// Ensure request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['course_id']) || !isset($data['title']) || !isset($data['content']) || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Missing required fields']);
    exit;
}

$courseId = $data['course_id'];
$title = trim($data['title']);
$content = trim($data['content']);
$userId = $data['user_id'];
$estimatedMinutes = $data['estimated_minutes'] ?? 30;
$status = $data['status'] ?? 'draft'; // Default to draft for new lessons

try {
    // Check if the user is the creator of the course
    $stmt = $conn->prepare("SELECT creator_id FROM courses WHERE course_id = ?");
    $stmt->execute([$courseId]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$course) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Course not found']);
        exit;
    }
    
    if ($course['creator_id'] != $userId) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to add lessons to this course']);
        exit;
    }
    
    // Get next order number for this course
    $stmt = $conn->prepare("
        SELECT COALESCE(MAX(order_number), 0) + 1 as next_order 
        FROM lessons 
        WHERE course_id = ?
    ");
    $stmt->execute([$courseId]);
    $nextOrder = $stmt->fetchColumn();
    
    // Create the new lesson
    $stmt = $conn->prepare("
        INSERT INTO lessons (course_id, title, content, order_number, estimated_minutes, status)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$courseId, $title, $content, $nextOrder, $estimatedMinutes, $status]);
    
    $lessonId = $conn->lastInsertId();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Lesson created successfully',
        'lesson' => [
            'lesson_id' => $lessonId,
            'course_id' => $courseId,
            'title' => $title,
            'content' => $content,
            'order_number' => $nextOrder,
            'estimated_minutes' => $estimatedMinutes,
            'status' => $status
        ]
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
