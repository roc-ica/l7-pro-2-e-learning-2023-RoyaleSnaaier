<?php
class AchievementChecker {
    private $conn;
    private $userId;

    public function __construct($conn, $userId) {
        $this->conn = $conn;
        $this->userId = $userId;
    }

    public function checkAllAchievements() {
        $achievements = $this->getAllAchievements();
        foreach ($achievements as $achievement) {
            $this->checkAchievement($achievement);
        }
    }

    public function checkAndUpdateAchievements() {
        $newlyUnlocked = [];
        $achievements = $this->getAllAchievements();
        
        foreach ($achievements as $achievement) {
            $progress = 0;
            
            switch ($achievement['category']) {
                case 'learning':
                    $progress = $this->checkLearningAchievement($achievement);
                    break;
                case 'social':
                    $progress = $this->checkSocialAchievement($achievement);
                    break;
                case 'milestone':
                    $progress = $this->checkMilestoneAchievement($achievement);
                    break;
                case 'special':
                    $progress = $this->checkSpecialAchievement($achievement);
                    break;
            }

            // Check if this achievement was just unlocked
            $wasUnlocked = $this->updateProgressAndCheckUnlock($achievement['achievement_id'], $progress);
            if ($wasUnlocked) {
                $newlyUnlocked[] = $achievement;
            }
        }

        return $newlyUnlocked;
    }

    private function getAllAchievements() {
        $stmt = $this->conn->prepare("SELECT * FROM achievements");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    private function checkAchievement($achievement) {
        $progress = 0;
        
        switch ($achievement['category']) {
            case 'learning':
                $progress = $this->checkLearningAchievement($achievement);
                break;
            case 'social':
                $progress = $this->checkSocialAchievement($achievement);
                break;
            case 'milestone':
                $progress = $this->checkMilestoneAchievement($achievement);
                break;
            case 'special':
                $progress = $this->checkSpecialAchievement($achievement);
                break;
        }

        $this->updateProgress($achievement['achievement_id'], $progress);
    }

    private function checkLearningAchievement($achievement) {
        error_log("Checking learning achievement: " . $achievement['achievement_id']);
        $progress = 0;
        
        switch ($achievement['achievement_id']) {
            case 'complete_first_course':
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM user_courses 
                    WHERE user_id = ? AND completion_status = 'completed'
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                error_log("Achievement check - complete_first_course: Progress = $progress");
                break;

            case 'watch_videos':
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM video_progress 
                    WHERE user_id = ? AND watched_percentage >= 90
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                break;

            case 'complete_first_lesson':
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM user_progress 
                    WHERE user_id = ? AND completed = 1
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                error_log("Achievement check - complete_first_lesson: Progress = $progress");
                break;

            case 'complete_five_lessons':
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM user_progress 
                    WHERE user_id = ? AND completed = 1
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                error_log("Achievement check - complete_five_lessons: Progress = $progress");
                break;

            case 'first_lesson':
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM user_progress 
                    WHERE user_id = ? AND completed = 1
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                error_log("First lesson progress: $progress");
                break;
                
            case 'perfect_score':
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM exercise_attempts 
                    WHERE user_id = ? AND is_correct = 1
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                error_log("Perfect score progress: $progress");
                break;

            // Add more learning achievement checks here
        }
        
        error_log("Final progress for {$achievement['achievement_id']}: $progress");
        return $progress;
    }

    private function checkSocialAchievement($achievement) {
        $progress = 0;
        switch ($achievement['achievement_id']) {
            case 'make_friends':
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM friendships 
                    WHERE (user1_id = ? OR user2_id = ?) AND status = 'accepted'
                ");
                $stmt->execute([$this->userId, $this->userId]);
                $progress = $stmt->fetchColumn();
                break;

            case 'forum_posts':
                $stmt = $this->conn->prepare("
                    SELECT COUNT(*) FROM forum_posts WHERE user_id = ?
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                break;

            // Add more social achievement checks here
        }
        return $progress;
    }

    private function checkMilestoneAchievement($achievement) {
        $progress = 0;
        switch ($achievement['achievement_id']) {
            case 'login_streak':
                $stmt = $this->conn->prepare("
                    SELECT MAX(consecutive_days) FROM login_streaks 
                    WHERE user_id = ?
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                break;

            case 'points_earned':
                $stmt = $this->conn->prepare("
                    SELECT total_points FROM user_stats 
                    WHERE user_id = ?
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn();
                break;

            // Add more milestone achievement checks here
        }
        return $progress;
    }

    private function checkSpecialAchievement($achievement) {
        $progress = 0;
        switch ($achievement['achievement_id']) {
            case 'early_adopter':
                $stmt = $this->conn->prepare("
                    SELECT DATEDIFF(CURRENT_DATE, join_date) 
                    FROM users WHERE user_id = ?
                ");
                $stmt->execute([$this->userId]);
                $progress = $stmt->fetchColumn() >= 30 ? 1 : 0;
                break;

            // Add more special achievement checks here
        }
        return $progress;
    }

    private function updateProgress($achievementId, $progress) {
        // First check if there's an existing record
        $stmt = $this->conn->prepare("
            SELECT progress, max_progress 
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.achievement_id
            WHERE ua.user_id = ? AND ua.achievement_id = ?
        ");
        $stmt->execute([$this->userId, $achievementId]);
        $current = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($current) {
            // Update existing record if progress has changed
            if ($current['progress'] != $progress) {
                $stmt = $this->conn->prepare("
                    UPDATE user_achievements 
                    SET progress = ?,
                        unlocked_at = CASE 
                            WHEN ? >= ? AND unlocked_at IS NULL 
                            THEN CURRENT_TIMESTAMP 
                            ELSE unlocked_at 
                        END
                    WHERE user_id = ? AND achievement_id = ?
                ");
                $stmt->execute([$progress, $progress, $current['max_progress'], $this->userId, $achievementId]);
            }
        } else {
            // Insert new record
            $stmt = $this->conn->prepare("
                INSERT INTO user_achievements (user_id, achievement_id, progress) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$this->userId, $achievementId, $progress]);
        }
    }

    private function updateProgressAndCheckUnlock($achievementId, $progress) {
        error_log("Updating progress for achievement: $achievementId with progress: $progress");
        
        // First check if there's an existing record
        $stmt = $this->conn->prepare("
            SELECT ua.progress, ua.unlocked_at, a.max_progress 
            FROM achievements a
            LEFT JOIN user_achievements ua ON ua.achievement_id = a.achievement_id 
                AND ua.user_id = ?
            WHERE a.achievement_id = ?
        ");
        $stmt->execute([$this->userId, $achievementId]);
        $current = $stmt->fetch(PDO::FETCH_ASSOC);

        $wasJustUnlocked = false;

        if ($current) {
            // Check if achievement would be newly unlocked
            $wouldUnlock = ($progress >= $current['max_progress'] && !$current['unlocked_at']);
            
            // Update if progress changed
            if ($current['progress'] != $progress) {
                $stmt = $this->conn->prepare("
                    INSERT INTO user_achievements (user_id, achievement_id, progress, unlocked_at)
                    VALUES (?, ?, ?, CASE WHEN ? >= ? THEN CURRENT_TIMESTAMP ELSE NULL END)
                    ON DUPLICATE KEY UPDATE 
                        progress = ?,
                        unlocked_at = CASE 
                            WHEN ? >= ? AND unlocked_at IS NULL 
                            THEN CURRENT_TIMESTAMP 
                            ELSE unlocked_at 
                        END
                ");
                $stmt->execute([
                    $this->userId, 
                    $achievementId, 
                    $progress,
                    $progress, 
                    $current['max_progress'],
                    $progress,
                    $progress, 
                    $current['max_progress']
                ]);

                $wasJustUnlocked = $wouldUnlock;
            }
        } else {
            // Insert new record
            $stmt = $this->conn->prepare("
                INSERT INTO user_achievements (user_id, achievement_id, progress) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$this->userId, $achievementId, $progress]);
        }

        if ($wasJustUnlocked) {
            error_log("Achievement $achievementId was just unlocked!");
        }
        
        return $wasJustUnlocked;
    }
}
