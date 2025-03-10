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
    $stmt = $conn->prepare("
        SELECT 
            c.course_id as courseId,
            c.title,
            COUNT(DISTINCT l.lesson_id) as total,
            COUNT(DISTINCT CASE WHEN up.completed = 1 THEN l.lesson_id END) as completed,
            COALESCE(
                ROUND(
                    (COUNT(DISTINCT CASE WHEN up.completed = 1 THEN l.lesson_id END) * 100.0) /
                    COUNT(DISTINCT l.lesson_id)
                ), 0
            ) as progress,
            SUM(CASE WHEN up.completed = 1 THEN up.score ELSE 0 END) as total_score
        FROM courses c
        LEFT JOIN lessons l ON c.course_id = l.course_id
        LEFT JOIN user_progress up ON l.lesson_id = up.lesson_id AND up.user_id = ?
        WHERE c.status = 'active'
        GROUP BY c.course_id, c.title
        ORDER BY c.course_id
    ");
    $stmt->execute([$userId]);
    $progress = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'progress' => array_map(function($course) {
            return [
                'courseId' => (int)$course['courseId'],
                'title' => $course['title'],
                'progress' => (int)$course['progress'],
                'completed' => (int)$course['completed'],
                'total' => (int)$course['total'],
                'total_score' => (int)$course['total_score']
            ];
        }, $progress)
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
