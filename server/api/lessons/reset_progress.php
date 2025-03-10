<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['user_id'] ?? null;
$lessonId = $data['lesson_id'] ?? null;

if (!$userId || !$lessonId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'User ID and Lesson ID are required']);
    exit;
}

try {
    $conn->beginTransaction();

    // Delete exercise attempts
    $stmt = $conn->prepare("
        DELETE ea FROM exercise_attempts ea
        JOIN exercises e ON ea.exercise_id = e.exercise_id
        WHERE e.lesson_id = ? AND ea.user_id = ?
    ");
    $stmt->execute([$lessonId, $userId]);

    // Reset lesson progress and score
    $stmt = $conn->prepare("
        UPDATE user_progress 
        SET completed = 0, score = 0, completed_at = NULL 
        WHERE lesson_id = ? AND user_id = ?
    ");
    $stmt->execute([$lessonId, $userId]);

    // If no row was updated, insert a new record
    if ($stmt->rowCount() === 0) {
        $stmt = $conn->prepare("
            INSERT INTO user_progress (user_id, lesson_id, completed, score) 
            VALUES (?, ?, 0, 0)
        ");
        $stmt->execute([$userId, $lessonId]);
    }

    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'Progress reset successfully'
    ]);
} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
