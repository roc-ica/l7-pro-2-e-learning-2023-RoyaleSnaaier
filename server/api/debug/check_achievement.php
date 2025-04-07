<?php
require_once '../../config/cors.php';
require_once '../../config/database.php';
require_once '../../services/AchievementChecker.php';

header('Content-Type: text/html');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$userId = $_GET['user_id'] ?? null;

if (!$userId) {
    die('Missing user_id parameter');
}

// First, let's insert a test progress record
try {
    $stmt = $conn->prepare("
        INSERT INTO user_progress (user_id, lesson_id, completed, completed_at)
        VALUES (?, 1, 1, NOW())
    ");
    $stmt->execute([$userId]);
    echo "Added test progress.<br>";
} catch (PDOException $e) {
    echo "Error adding test progress: " . $e->getMessage() . "<br>";
}

// Now show all the debug info
echo "<h2>Achievement Debug Info</h2>";

// Add some direct SQL verification
echo "<h3>SQL Verification:</h3>";
$queries = [
    "User Progress" => "SELECT * FROM user_progress WHERE user_id = ?",
    "User Achievements" => "SELECT * FROM user_achievements WHERE user_id = ?",
    "All Achievements" => "SELECT * FROM achievements",
];

foreach ($queries as $title => $query) {
    echo "<h4>$title:</h4>";
    $stmt = $conn->prepare($query);
    $stmt->execute([$userId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "<pre>";
    print_r($data);
    echo "</pre>";
}

// 1. Show current achievements
echo "<h3>Current Achievements:</h3>";
$stmt = $conn->prepare("
    SELECT a.*, ua.progress, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.achievement_id = ua.achievement_id AND ua.user_id = ?
");
$stmt->execute([$userId]);
$current = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($current);
echo "</pre>";

// 2. Show user progress
echo "<h3>User Progress:</h3>";
$stmt = $conn->prepare("
    SELECT * FROM user_progress 
    WHERE user_id = ?
");
$stmt->execute([$userId]);
$progress = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($progress);
echo "</pre>";

// 3. Check achievements
echo "<h3>Checking Achievements:</h3>";
$checker = new AchievementChecker($conn, $userId);
$result = $checker->checkAndUpdateAchievements();
echo "<pre>";
print_r($result);
echo "</pre>";

// 4. Show updated achievements
echo "<h3>Updated Achievements:</h3>";
$stmt = $conn->prepare("
    SELECT a.*, ua.progress, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.achievement_id = ua.achievement_id AND ua.user_id = ?
");
$stmt->execute([$userId]);
$updated = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo "<pre>";
print_r($updated);
echo "</pre>";
