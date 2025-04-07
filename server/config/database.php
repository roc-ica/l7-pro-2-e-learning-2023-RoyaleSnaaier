<?php
$host = getenv('DB_HOST') ?: 'database';
$dbname = getenv('DB_NAME') ?: 'learning_application';
$user = getenv('DB_USER') ?: 'admin';
$pass = getenv('DB_PASS') ?: 'admin';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // Log the error but don't expose details in production
    error_log('Connection Error: ' . $e->getMessage());
    // The test.php file will handle displaying the error
}
?>
