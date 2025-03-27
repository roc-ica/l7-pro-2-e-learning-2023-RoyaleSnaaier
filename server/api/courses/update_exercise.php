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
if (!isset($data['exercise_id']) || !isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Exercise ID and User ID are required']);
    exit;
}

$exerciseId = $data['exercise_id'];
$userId = $data['user_id'];

try {
    $conn->beginTransaction();
    
    // Check if the user is the creator of the course this exercise belongs to
    $stmt = $conn->prepare("
        SELECT c.creator_id, e.exercise_id, e.exercise_type
        FROM exercises e
        JOIN lessons l ON e.lesson_id = l.lesson_id
        JOIN courses c ON l.course_id = c.course_id
        WHERE e.exercise_id = ?
    ");
    $stmt->execute([$exerciseId]);
    $exerciseInfo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$exerciseInfo) {
        $conn->rollBack();
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Exercise not found']);
        exit;
    }
    
    if ($exerciseInfo['creator_id'] != $userId) {
        $conn->rollBack();
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to update this exercise']);
        exit;
    }

    // Build the update query based on provided fields
    $updateFields = [];
    $params = [];
    
    if (isset($data['question'])) {
        $updateFields[] = "question = ?";
        $params[] = trim($data['question']);
    }
    
    if (isset($data['correct_answer'])) {
        $updateFields[] = "correct_answer = ?";
        $params[] = trim($data['correct_answer']);
    }
    
    if (isset($data['points'])) {
        $updateFields[] = "points = ?";
        $params[] = (int)$data['points'];
    }
    
    if (isset($data['exercise_type'])) {
        $validTypes = ['Multiple Choice', 'Fill in the blank', 'Writing'];
        if (!in_array($data['exercise_type'], $validTypes)) {
            $conn->rollBack();
            http_response_code(400);
            echo json_encode(['status' => 'error', 'error' => 'Invalid exercise type']);
            exit;
        }
        $updateFields[] = "exercise_type = ?";
        $params[] = $data['exercise_type'];
    }
    
    if (!empty($updateFields)) {
        // Add exercise_id to params
        $params[] = $exerciseId;
        
        // Update the exercise
        $stmt = $conn->prepare("
            UPDATE exercises 
            SET " . implode(", ", $updateFields) . "
            WHERE exercise_id = ?
        ");
        $stmt->execute($params);
    }
    
    // If options are provided for a multiple choice exercise, update them
    if (isset($data['options']) && $exerciseInfo['exercise_type'] === 'Multiple Choice') {
        // First remove existing options
        $stmt = $conn->prepare("DELETE FROM exercise_options WHERE exercise_id = ?");
        $stmt->execute([$exerciseId]);
        
        // Then insert the new ones
        $optionStmt = $conn->prepare("
            INSERT INTO exercise_options (exercise_id, option_text, is_correct)
            VALUES (?, ?, ?)
        ");
        
        foreach ($data['options'] as $option) {
            $optionText = trim($option['text']);
            $isCorrect = isset($option['is_correct']) ? (bool)$option['is_correct'] : false;
            
            $optionStmt->execute([$exerciseId, $optionText, $isCorrect]);
        }
    }
    
    $conn->commit();
    
    // Get the updated exercise with options
    $stmt = $conn->prepare("
        SELECT e.*, JSON_ARRAYAGG(
            JSON_OBJECT(
                'option_id', eo.option_id,
                'option_text', eo.option_text,
                'is_correct', eo.is_correct
            )
        ) as options
        FROM exercises e
        LEFT JOIN exercise_options eo ON e.exercise_id = eo.exercise_id
        WHERE e.exercise_id = ?
        GROUP BY e.exercise_id
    ");
    $stmt->execute([$exerciseId]);
    $updatedExercise = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Format the options as an array
    $updatedExercise['options'] = json_decode($updatedExercise['options'], true);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Exercise updated successfully',
        'exercise' => $updatedExercise
    ]);
} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
