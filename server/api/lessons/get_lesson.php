<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

$lessonId = $_GET['id'] ?? null;

if (!$lessonId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Lesson ID is required']);
    exit;
}

try {
    // Get lesson details
    $stmt = $conn->prepare("
        SELECT l.*, c.title as course_title 
        FROM lessons l
        JOIN courses c ON l.course_id = c.course_id
        WHERE l.lesson_id = ?
    ");
    $stmt->execute([$lessonId]);
    $lesson = $stmt->fetch();

    if (!$lesson) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Lesson not found']);
        exit;
    }

    // Updated exercises query with better grouping
    $stmt = $conn->prepare("
        SELECT 
            e.*,
            JSON_ARRAYAGG(
                IF(eo.option_id IS NOT NULL,
                    JSON_OBJECT(
                        'option_id', eo.option_id,
                        'option_text', eo.option_text,
                        'is_correct', eo.is_correct
                    ),
                    NULL
                )
            ) as options
        FROM exercises e
        LEFT JOIN exercise_options eo ON e.exercise_id = eo.exercise_id
        WHERE e.lesson_id = ?
        GROUP BY e.exercise_id
        ORDER BY e.exercise_id ASC
    ");
    $stmt->execute([$lessonId]);
    $exercises = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Improved options processing
    foreach ($exercises as &$exercise) {
        $options = json_decode($exercise['options'], true);
        $exercise['options'] = array_values(array_filter($options, function($option) {
            return $option !== null;
        }));
    }

    echo json_encode([
        'status' => 'success',
        'lesson' => [
            'lesson_id' => $lesson['lesson_id'],
            'course_id' => $lesson['course_id'],
            'course_title' => $lesson['course_title'],
            'title' => $lesson['title'],
            'content' => $lesson['content'],
            'order_number' => $lesson['order_number'],
            'exercises' => $exercises
        ]
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
