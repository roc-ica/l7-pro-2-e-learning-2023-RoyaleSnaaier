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
            c.*,
            COUNT(DISTINCT l.lesson_id) as total_lessons,
            COUNT(DISTINCT e.exercise_id) as total_exercises,
            COUNT(DISTINCT ce.user_id) as student_count
        FROM courses c
        LEFT JOIN lessons l ON c.course_id = l.course_id
        LEFT JOIN exercises e ON l.lesson_id = e.lesson_id
        LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id
        WHERE c.creator_id = ?
        GROUP BY c.course_id
        ORDER BY c.created_at DESC
    ");
    
    $stmt->execute([$userId]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'courses' => $courses
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => 'Failed to fetch user courses: ' . $e->getMessage()
    ]);
}
?>
