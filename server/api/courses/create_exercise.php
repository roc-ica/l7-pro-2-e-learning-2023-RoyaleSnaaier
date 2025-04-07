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
if (!isset($data['lesson_id']) || !isset($data['user_id']) || 
    !isset($data['question']) || !isset($data['correct_answer']) || 
    !isset($data['exercise_type'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Missing required fields']);
    exit;
}

$lessonId = $data['lesson_id'];
$userId = $data['user_id'];
$question = trim($data['question']);
$correctAnswer = trim($data['correct_answer']);
$exerciseType = $data['exercise_type'];
$points = $data['points'] ?? 10;
$options = $data['options'] ?? [];

// Validate exercise type
$validTypes = ['Multiple Choice', 'Fill in the blank', 'Writing'];
if (!in_array($exerciseType, $validTypes)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Invalid exercise type']);
    exit;
}

// For multiple choice, ensure options are provided
if ($exerciseType === 'Multiple Choice' && empty($options)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Multiple choice exercises require options']);
    exit;
}

try {
    $conn->beginTransaction();
    
    // Check if the user is the creator of the course this lesson belongs to
    $stmt = $conn->prepare("
        SELECT c.creator_id 
        FROM lessons l
        JOIN courses c ON l.course_id = c.course_id
        WHERE l.lesson_id = ?
    ");
    $stmt->execute([$lessonId]);
    $lessonInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$lessonInfo) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Lesson not found']);
        exit;
    }
    
    if ($lessonInfo['creator_id'] != $userId) {
        $conn->rollBack();
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to add exercises to this lesson']);
        exit;
    }
    
    // Create the exercise
    $stmt = $conn->prepare("
        INSERT INTO exercises (lesson_id, question, correct_answer, exercise_type, points)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$lessonId, $question, $correctAnswer, $exerciseType, $points]);
    
    $exerciseId = $conn->lastInsertId();
    
    // If multiple choice, add the options
    if ($exerciseType === 'Multiple Choice' && !empty($options)) {
        $optionStmt = $conn->prepare("
            INSERT INTO exercise_options (exercise_id, option_text, is_correct)
            VALUES (?, ?, ?)
        ");
        
        foreach ($options as $option) {
            $optionText = trim($option['text']);
            $isCorrect = isset($option['is_correct']) ? (bool)$option['is_correct'] : false;
            
            $optionStmt->execute([$exerciseId, $optionText, $isCorrect]);
        }
    }
    
    $conn->commit();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Exercise created successfully',
        'exercise' => [
            'exercise_id' => $exerciseId,
            'lesson_id' => $lessonId,
            'question' => $question,
            'correct_answer' => $correctAnswer,
            'exercise_type' => $exerciseType,
            'points' => $points
        ]
    ]);
} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
