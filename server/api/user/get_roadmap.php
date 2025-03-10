<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'User ID is required']);
    exit;
}

try {
    // First get all difficulty levels
    $stmt = $conn->query("
        SELECT DISTINCT difficulty_level 
        FROM courses 
        WHERE status = 'active'
        ORDER BY FIELD(difficulty_level, 'Beginner', 'Intermediate', 'Advanced')
    ");
    $difficultyLevels = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Get courses with their lessons and progress
    $stmt = $conn->prepare("
        SELECT 
            c.course_id,
            c.title as course_title,
            c.difficulty_level,
            l.lesson_id,
            l.title as lesson_title,
            l.order_number,
            COALESCE(up.completed, 0) as completed,
            COALESCE(up.score, 0) as score
        FROM courses c
        LEFT JOIN lessons l ON c.course_id = l.course_id
        LEFT JOIN user_progress up ON l.lesson_id = up.lesson_id AND up.user_id = ?
        WHERE c.status = 'active'
        ORDER BY 
            FIELD(c.difficulty_level, 'Beginner', 'Intermediate', 'Advanced'),
            c.course_id,
            l.order_number
    ");
    $stmt->execute([$userId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Initialize stages array based on difficulty levels
    $stages = array_map(function($difficulty, $index) {
        return [
            'id' => $index + 1,
            'difficulty_level' => $difficulty,
            'title' => $difficulty,
            'lessons' => []
        ];
    }, $difficultyLevels, array_keys($difficultyLevels));

    // Map of difficulty level to stage index
    $difficultyMap = array_flip($difficultyLevels);

    // Organize lessons into their respective stages
    foreach ($results as $row) {
        if ($row['lesson_id']) {
            $stageIndex = $difficultyMap[$row['difficulty_level']];
            $stages[$stageIndex]['lessons'][] = [
                'id' => (int)$row['lesson_id'],
                'title' => $row['lesson_title'],
                'completed' => (bool)$row['completed'],
                'score' => (int)$row['score'],
                'order' => (int)$row['order_number']
            ];
        }
    }

    // Filter out empty stages and reindex array
    $stages = array_values(array_filter($stages, function($stage) {
        return !empty($stage['lessons']);
    }));

    echo json_encode([
        'status' => 'success',
        'stages' => $stages
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
