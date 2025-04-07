<?php
// Make sure CORS is included first, before any output
require_once '../../config/cors.php';
require_once '../../config/database.php';

header('Content-Type: application/json');

try {
    // Query to get all active courses
    $stmt = $conn->prepare("
        SELECT c.*, 
               COUNT(DISTINCT l.lesson_id) as total_lessons,
               COALESCE(u.username, 'Admin') as creator_name
        FROM courses c
        LEFT JOIN lessons l ON c.course_id = l.course_id AND l.status = 'active'
        LEFT JOIN users u ON c.creator_id = u.user_id
        WHERE c.status = 'active' AND c.is_public = 1
        GROUP BY c.course_id
        ORDER BY c.created_at DESC
    ");
    $stmt->execute();
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'courses' => $courses
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
