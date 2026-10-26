<?php
// 1. Database connection include karo
require_once 'db.php';

// 2. GET parameter receive karo URL se (?username=...)
$username = isset($_GET['username']) ? $_GET['username'] : '';

echo "<h2>User Search (Vulnerable)</h2>";

if (!empty($username)) {
    // 3. Vulnerable SQL Query (Direct String Concatenation - NO Sanitization / NO Escaping)
    $sql = "SELECT id, username FROM users WHERE username = '$username'";
    
    echo "<p><strong>Executed Query:</strong> <code>" . htmlspecialchars($sql) . "</code></p><hr>";

    $result = mysqli_query($conn, $sql);

    if ($result) {
        if (mysqli_num_rows($result) > 0) {
            echo "<h3>Results Found:</h3>";
            echo "<ul>";
            // 4. Result ko loop se print karo
            while ($row = mysqli_fetch_assoc($result)) {
                echo "<li>ID: " . $row['id'] . " | Username: " . $row['username'] . "</li>";
            }
            echo "</ul>";
        } else {
            echo "<p>No user found with username: " . htmlspecialchars($username) . "</p>";
        }
    } else {
        // Query syntax error dikhane ke liye (SQLi analysis / debugging me help karta hai)
        echo "<p style='color:red;'><strong>SQL Error:</strong> " . mysqli_error($conn) . "</p>";
    }
} else {
    echo "<p>Please pass a username parameter in the URL. Example: <code>search.php?username=admin</code></p>";
}
?>


