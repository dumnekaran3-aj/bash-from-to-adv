<?php

$conn = mysqli_connect("localhost", "labuser", "labpass123", "sqli_lab");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

echo "Connected";

?>
