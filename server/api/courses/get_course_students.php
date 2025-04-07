<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

$courseId = $_GET['course_id'] ?? null;
$userId = $_GET['user_id'] ?? null;  // Course creator's user ID

if (!$courseId || !$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'Course ID and User ID are required']);
    exit;
}

try {
    // Verify the requesting user is the course creator
    $stmt = $conn->prepare("SELECT creator_id FROM courses WHERE course_id = ?");
    $stmt->execute([$courseId]);
    $course = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$course) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'error' => 'Course not found']);
        exit;
    }
    
    if ($course['creator_id'] != $userId) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'error' => 'You do not have permission to view this course\'s students']);
        exit;
    }
    
    // Get all enrolled students with their progress
    $stmt = $conn->prepare("
        SELECT 
            u.user_id,
            u.username,
            p.first_name,
            p.last_name,
            ce.enrolled_at,
            COUNT(DISTINCT l.lesson_id) as total_lessons,
            COUNT(DISTINCT CASE WHEN up.completed = 1 THEN up.lesson_id END) as completed_lessons,
            COALESCE(SUM(CASE WHEN up.completed = 1 THEN up.score ELSE 0 END), 0) as total_score
        FROM course_enrollments ce
        JOIN users u ON ce.user_id = u.user_id
        LEFT JOIN user_profiles p ON u.user_id = p.user_id
        LEFT JOIN lessons l ON ce.course_id = l.course_id
        LEFT JOIN user_progress up ON l.lesson_id = up.lesson_id AND up.user_id = u.user_id
        WHERE ce.course_id = ?
        GROUP BY u.user_id, u.username, p.first_name, p.last_name, ce.enrolled_at
        ORDER BY completed_lessons DESC, total_score DESC
    ");
    
    $stmt->execute([$courseId]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'students' => array_map(function($student) {
            // Calculate completion percentage
            $completionPercentage = $student['total_lessons'] > 0 
                ? round(($student['completed_lessons'] / $student['total_lessons']) * 100) 
                : 0;
                
            return [
                'user_id' => (int)$student['user_id'],
                'username' => $student['username'],
                'name' => trim($student['first_name'] . ' ' . $student['last_name']),
                'enrolled_at' => $student['enrolled_at'],
                'total_lessons' => (int)$student['total_lessons'],
                'completed_lessons' => (int)$student['completed_lessons'],
                'completion_percentage' => $completionPercentage,
                'total_score' => (int)$student['total_score']
            ];
        }, $students)
    ]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
