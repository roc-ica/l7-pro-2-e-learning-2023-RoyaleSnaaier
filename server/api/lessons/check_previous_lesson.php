<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

$lessonId = $_GET['lesson_id'] ?? null;
$userId = $_GET['user_id'] ?? null;

if (!$lessonId || !$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Lesson ID and User ID are required']);
    exit;
}

try {
    // First, get the current lesson's course and order number
    $stmt = $conn->prepare("
        SELECT course_id, order_number 
        FROM lessons 
        WHERE lesson_id = ?
    ");
    $stmt->execute([$lessonId]);
    $currentLesson = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$currentLesson) {
        echo json_encode(['status' => 'error', 'error' => 'Lesson not found']);
        exit;
    }

    // If it's the first lesson (order_number = 1), no previous lesson check needed
    if ($currentLesson['order_number'] <= 1) {
        echo json_encode(['status' => 'success', 'is_completed' => true]);
        exit;
    }

    // Get the previous lesson's completion status
    $stmt = $conn->prepare("
        SELECT COALESCE(
            (SELECT completed 
             FROM user_progress up
             JOIN lessons l ON up.lesson_id = l.lesson_id
             WHERE l.course_id = :course_id 
             AND l.order_number = :prev_order
             AND up.user_id = :user_id
             LIMIT 1
            ),
            0
        ) as is_completed
    ");

    $stmt->execute([
        ':course_id' => $currentLesson['course_id'],
        ':prev_order' => $currentLesson['order_number'] - 1,
        ':user_id' => $userId
    ]);

    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'is_completed' => (bool)$result['is_completed']
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
