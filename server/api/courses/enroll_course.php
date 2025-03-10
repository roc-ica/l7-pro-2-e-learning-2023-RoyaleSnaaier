<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$userId = $data['user_id'] ?? null;
$courseId = $data['course_id'] ?? null;

if (!$userId || !$courseId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'error' => 'User ID and Course ID are required']);
    exit;
}

try {
    // Check if already enrolled
    $stmt = $conn->prepare("
        SELECT enrolled_at 
        FROM course_enrollments 
        WHERE user_id = ? AND course_id = ?
    ");
    $stmt->execute([$userId, $courseId]);
    
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'error' => 'Already enrolled in this course']);
        exit;
    }

    // Enroll in course
    $stmt = $conn->prepare("
        INSERT INTO course_enrollments (user_id, course_id, enrolled_at)
        VALUES (?, ?, NOW())
    ");
    $stmt->execute([$userId, $courseId]);

    echo json_encode(['status' => 'success', 'message' => 'Successfully enrolled in course']);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
