<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

// Accept both PUT and POST for flexibility
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['lesson_id']) || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Lesson ID and User ID are required']);
    exit;
}

$lessonId = $data['lesson_id'];
$userId = $data['user_id'];

try {
    // Check if the user is the creator of the course this lesson belongs to
    $stmt = $conn->prepare("
        SELECT c.creator_id, l.lesson_id 
        FROM lessons l
        JOIN courses c ON l.course_id = c.course_id
        WHERE l.lesson_id = ?
    ");
    $stmt->execute([$lessonId]);
    $lessonInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$lessonInfo) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Lesson not found']);
        exit;
    }
    
    if ($lessonInfo['creator_id'] != $userId) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to update this lesson']);
        exit;
    }
    
    // Build the update query based on provided fields
    $updateFields = [];
    $params = [];
    
    if (isset($data['title'])) {
        $updateFields[] = "title = ?";
        $params[] = trim($data['title']);
    }
    
    if (isset($data['content'])) {
        $updateFields[] = "content = ?";
        $params[] = trim($data['content']);
    }
    
    if (isset($data['estimated_minutes'])) {
        $updateFields[] = "estimated_minutes = ?";
        $params[] = (int)$data['estimated_minutes'];
    }
    
    if (isset($data['status'])) {
        $validStatuses = ['active', 'draft', 'archived'];
        if (!in_array($data['status'], $validStatuses)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'error' => 'Invalid status']);
            exit;
        }
        $updateFields[] = "status = ?";
        $params[] = $data['status'];
    }
    
    if (isset($data['order_number'])) {
        $updateFields[] = "order_number = ?";
        $params[] = (int)$data['order_number'];
    }
    
    if (empty($updateFields)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'error' => 'No fields to update']);
        exit;
    }
    
    // Add lesson_id to params
    $params[] = $lessonId;
    
    // Update the lesson
    $stmt = $conn->prepare("
        UPDATE lessons 
        SET " . implode(", ", $updateFields) . "
        WHERE lesson_id = ?
    ");
    $stmt->execute($params);
    
    // Get the updated lesson
    $stmt = $conn->prepare("SELECT * FROM lessons WHERE lesson_id = ?");
    $stmt->execute([$lessonId]);
    $updatedLesson = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Lesson updated successfully',
        'lesson' => $updatedLesson
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
