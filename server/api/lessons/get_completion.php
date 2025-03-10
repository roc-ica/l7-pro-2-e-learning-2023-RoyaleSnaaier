<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';

$lessonId = $_GET['lesson_id'] ?? null;
$userId = $_GET['user_id'] ?? null;

if (!$lessonId || !$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Missing parameters']);
    exit;
}

try {
    // Get total exercises and correct answers using the latest attempts only
    $stmt = $conn->prepare("
        WITH LatestAttempts AS (
            SELECT 
                exercise_id,
                is_correct,
                attempted_at,
                ROW_NUMBER() OVER (PARTITION BY exercise_id ORDER BY attempted_at DESC) as rn
            FROM exercise_attempts
            WHERE user_id = ?
        )
        SELECT 
            (SELECT COUNT(*) FROM exercises WHERE lesson_id = ?) as total_exercises,
            COUNT(CASE WHEN la.is_correct = 1 THEN 1 END) as correct_answers,
            COALESCE(SUM(CASE WHEN la.is_correct = 1 THEN e.points ELSE 0 END), 0) as total_points,
            l.title as lesson_title,
            (
                SELECT MIN(l2.lesson_id)
                FROM lessons l2
                WHERE l2.course_id = l.course_id
                AND l2.order_number > l.order_number
            ) as next_lesson_id,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'exercise_id', e.exercise_id,
                        'question', e.question,
                        'user_answer', ea.user_answer,
                        'correct_answer', e.correct_answer,
                        'is_correct', ea.is_correct,
                        'attempted_at', ea.attempted_at
                    )
                )
                FROM exercises e
                LEFT JOIN exercise_attempts ea ON e.exercise_id = ea.exercise_id 
                AND ea.user_id = ?
                WHERE e.lesson_id = l.lesson_id
            ) as exercise_history
        FROM lessons l
        LEFT JOIN exercises e ON l.lesson_id = e.lesson_id
        LEFT JOIN LatestAttempts la ON e.exercise_id = la.exercise_id AND la.rn = 1
        WHERE l.lesson_id = ?
        GROUP BY l.lesson_id, l.title, l.course_id, l.order_number
    ");

    $stmt->execute([$userId, $lessonId, $userId, $lessonId]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        $history = json_decode($result['exercise_history'] ?? '[]', true);
        echo json_encode([
            'status' => 'success',
            'total_exercises' => (int)$result['total_exercises'],
            'correct_answers' => (int)$result['correct_answers'],
            'total_points' => (int)$result['total_points'],
            'lesson_title' => $result['lesson_title'],
            'next_lesson_id' => $result['next_lesson_id'] ? (int)$result['next_lesson_id'] : null,
            'exercise_history' => $history
        ]);
    } else {
        echo json_encode(['status' => 'error', 'error' => 'Lesson not found']);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
