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
    // Simplified query that's more reliable
    $stmt = $conn->prepare("
        SELECT 
            c.course_id,
            c.title,
            c.difficulty_level,
            c.status,
            ce.enrolled_at,
            (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.course_id) as total_lessons,
            (SELECT COUNT(DISTINCT l.lesson_id) 
             FROM lessons l 
             JOIN user_progress up ON l.lesson_id = up.lesson_id 
             WHERE l.course_id = c.course_id 
             AND up.user_id = ? 
             AND up.completed = 1) as completed_lessons
        FROM courses c
        INNER JOIN course_enrollments ce ON c.course_id = ce.course_id
        WHERE ce.user_id = ?
        AND c.status = 'active'
        ORDER BY ce.enrolled_at DESC
    ");
    
    $stmt->execute([$userId, $userId]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'courses' => array_map(function($course) {
            return [
                'id' => (int)$course['course_id'],
                'title' => $course['title'],
                'difficulty_level' => $course['difficulty_level'],
                'total_lessons' => (int)$course['total_lessons'],
                'completed_lessons' => (int)$course['completed_lessons'],
                'enrolled_at' => $course['enrolled_at']
            ];
        }, $courses)
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error', 
        'error' => 'Database error: ' . $e->getMessage(),
        'details' => $e->getMessage() // Add this for debugging
    ]);
}
?>
