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
$exerciseId = $data['exercise_id'] ?? null;
$userId = $data['user_id'] ?? null;

if (!$exerciseId || !$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Exercise ID and User ID are required']);
    exit;
}

try {
    $conn->beginTransaction();
    
    // Check if user is the creator of the course that contains this exercise
    $stmt = $conn->prepare("
        SELECT c.creator_id
        FROM exercises e
        JOIN lessons l ON e.lesson_id = l.lesson_id
        JOIN courses c ON l.course_id = c.course_id
        WHERE e.exercise_id = ?
    ");
    $stmt->execute([$exerciseId]);
    $exercise = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$exercise) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Exercise not found']);
        exit;
    }
    
    if ($exercise['creator_id'] != $userId) {
        $conn->rollBack();
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to delete this exercise']);
        exit;
    }
    
    // Delete related options first (to handle foreign key constraints)
    $stmt = $conn->prepare("DELETE FROM exercise_options WHERE exercise_id = ?");
    $stmt->execute([$exerciseId]);
    
    // Delete exercise attempts
    $stmt = $conn->prepare("DELETE FROM exercise_attempts WHERE exercise_id = ?");
    $stmt->execute([$exerciseId]);
    
    // Delete the exercise itself
    $stmt = $conn->prepare("DELETE FROM exercises WHERE exercise_id = ?");
    $stmt->execute([$exerciseId]);
    
    $conn->commit();
    echo json_encode([
        'status' => 'success',
        'message' => 'Exercise deleted successfully'
    ]);
} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
