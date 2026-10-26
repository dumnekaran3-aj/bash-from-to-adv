<?php
   include 'db.php';

   if ($_SERVER['REQUEST_METHOD'] == 'POST') {
       
       $username = $_POST['username'];   // POST array se 'username' nikalo
       $password = $_POST['password'];   // POST array se 'password' nikalo

       $query = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";

       // $username aur $password ko yahan variable-interpolation se daalo

       $result = mysqli_query($conn, $query);   // mysqli_query() call karo, $conn aur $query dono do

       if (mysqli_num_rows($result) > 0) {    // mysqli_num_rows($result) check karo
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
<style>

#form {

background-color:blue;


}



</style>

