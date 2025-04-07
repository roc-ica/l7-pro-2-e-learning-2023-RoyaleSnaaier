<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['exercise_id']) || !isset($data['user_id']) || !isset($data['answer'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Missing required fields']);
    exit;
}

try {
    $conn->beginTransaction();

    // Record the attempt
    $stmt = $conn->prepare("
        INSERT INTO exercise_attempts (user_id, exercise_id, user_answer, is_correct, attempted_at)
        SELECT 
            ?, -- user_id
            ?, -- exercise_id
            ?, -- user_answer
            CASE 
                WHEN e.exercise_type = 'Multiple Choice' THEN 
                    EXISTS(SELECT 1 FROM exercise_options WHERE exercise_id = ? AND option_text = ? AND is_correct = 1)
                ELSE ? = e.correct_answer 
            END,
            CURRENT_TIMESTAMP
        FROM exercises e
        WHERE e.exercise_id = ?
    ");

    $stmt->execute([
        $data['user_id'],
        $data['exercise_id'],
        $data['answer'],
        $data['exercise_id'],
        $data['answer'],
        $data['answer'],
        $data['exercise_id']
    ]);

    // Get the result of this attempt
    $stmt = $conn->prepare("
        SELECT is_correct, 
               (SELECT points FROM exercises WHERE exercise_id = ?) as points
        FROM exercise_attempts 
        WHERE exercise_id = ? AND user_id = ?
        ORDER BY attempted_at DESC
        LIMIT 1
    ");
    
    $stmt->execute([$data['exercise_id'], $data['exercise_id'], $data['user_id']]);
    $result = $stmt->fetch();

    // Update user progress if correct
    if ($result['is_correct']) {
        $stmt = $conn->prepare("
            INSERT INTO user_progress (user_id, lesson_id, score, completed)
            SELECT ?, e.lesson_id, ?, TRUE
            FROM exercises e
            WHERE e.exercise_id = ?
            ON DUPLICATE KEY UPDATE
            score = GREATEST(score, ?),
            completed = TRUE
        ");
        $stmt->execute([
            $data['user_id'],
            $result['points'],
            $data['exercise_id'],
            $result['points']
        ]);
    }

    $conn->commit();

    echo json_encode([
        'status' => 'success',
        'result' => [
            'is_correct' => (bool)$result['is_correct'],
            'points' => (int)$result['points']
        ]
    ]);

} catch(PDOException $e) {
    $conn->rollBack();
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
