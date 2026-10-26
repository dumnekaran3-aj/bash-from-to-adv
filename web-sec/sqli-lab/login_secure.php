<?php
   include 'db.php';

   if ($_SERVER['REQUEST_METHOD'] == 'POST') {

       $username = $_POST['username'];

       $password = $_POST['password'];




$query = "SELECT * FROM users WHERE username = ? AND password = ?";
$stmt = mysqli_prepare($conn, $query);

mysqli_stmt_bind_param($stmt, "ss", $username, $password);

mysqli_stmt_execute($stmt);
echo "DEBUG username: [" . $username . "] password: [" . $password . "]";
echo "DEBUG error: " . mysqli_stmt_error($stmt);

$result = mysqli_stmt_get_result($stmt);



       if (mysqli_num_rows($result) > 0) {
           echo "Login successful!";
       } else {
           echo "Login failed!";
       }

   }
   ?>

  <form id="form" method="POST">
       Username: <input type="text" name="username"><br>
       Password: <input type="password" name="password"><br>
       <input type="submit" value="Login">
   </form>
