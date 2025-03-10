<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

try {
    $stmt = $conn->query("
        SELECT 
            c.*,
            COUNT(DISTINCT l.lesson_id) as total_lessons,
            COUNT(DISTINCT e.exercise_id) as total_exercises
        FROM courses c
        LEFT JOIN lessons l ON c.course_id = l.course_id
        LEFT JOIN exercises e ON l.lesson_id = e.lesson_id
        WHERE c.status = 'active'
        GROUP BY c.course_id
        ORDER BY c.difficulty_level ASC, c.title ASC
    ");
    
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'courses' => $courses
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => 'Failed to fetch courses: ' . $e->getMessage()
    ]);
}
?>
