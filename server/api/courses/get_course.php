<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

$courseId = $_GET['id'] ?? null;
$userId = $_GET['user_id'] ?? null;

if (!$courseId) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'error' => 'Course ID is required'
    ]);
    exit;
}

try {
    // Update the query to include enrollment status
    $stmt = $conn->prepare("
        SELECT 
            c.*,
            l.lesson_id,
            l.title as lesson_title,
            l.order_number,
            COALESCE(MAX(up.completed), 0) as is_completed,
            COALESCE(MAX(up.score), 0) as lesson_score,
            CASE WHEN ce.enrolled_at IS NOT NULL THEN 1 ELSE 0 END as is_enrolled
        FROM courses c
        LEFT JOIN lessons l ON c.course_id = l.course_id
        LEFT JOIN user_progress up ON l.lesson_id = up.lesson_id AND up.user_id = ?
        LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id AND ce.user_id = ?
        WHERE c.course_id = ?
        GROUP BY c.course_id, l.lesson_id, l.title, l.order_number
        ORDER BY l.order_number
    ");
    
    $stmt->execute([$userId, $userId, $courseId]);
    $results = $stmt->fetchAll();

    if ($results) {
        $course = [
            'course_id' => $results[0]['course_id'],
            'title' => $results[0]['title'],
            'description' => $results[0]['description'],
            'difficulty_level' => $results[0]['difficulty_level'],
            'image_url' => $results[0]['image_url'],
            'created_at' => $results[0]['created_at'], // Add this line
            'status' => $results[0]['status'] // Add this line too for completeness
        ];

        $lessons = array_map(function($row) {
            return [
                'lesson_id' => $row['lesson_id'],
                'title' => $row['lesson_title'],  // Use alias to avoid column name conflict
                'order_number' => $row['order_number'],
                'is_completed' => (bool)$row['is_completed'],
                'score' => (int)$row['lesson_score']
            ];
        }, array_filter($results, function($row) {
            return !is_null($row['lesson_id']); // Filter out rows without lessons
        }));

        echo json_encode([
            'status' => 'success',
            'course' => $course,
            'lessons' => $lessons,
            'is_enrolled' => (bool)$results[0]['is_enrolled'] // Add this line to include enrollment status
        ]);
    } else {
        echo json_encode(['status' => 'error', 'error' => 'Course not found']);
    }
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
