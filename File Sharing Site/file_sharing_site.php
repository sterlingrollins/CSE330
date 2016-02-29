<?php
// Start the session
session_start();
?>
<!DOCTYPE html>
<html>

<head>
	<link rel="stylesheet" type="text/css" href="file_sharing_site.css">
	<title> File Sharing Site, Sterling and Max </title>
</head>
<body>


<h1> Welcome to Sterling and Max's File Sharing Site! </h1>
<div class="login_body">
<h2> Log In </h2>
<form class="login_form" action="http://ec2-52-25-221-1.us-west-2.compute.amazonaws.com/file_sharing_site.php" method="post">
Username: <input type="text" name="user">
<input type="submit" value="Submit">
</form>
<p style="padding-left:22%"> (or enter a new one) </p>

<?php


$user_file    = file_get_contents('../user.txt');

$users = explode("\n", $user_file);



if (isset($_POST["user"])&& $_POST['user']!='' ){
	$filtered_name =  $_POST['user'];

	$_SESSION["user"] = $filtered_name;

	if(in_array($_SESSION["user"], $users)){

	
		header("location: file_sharing_user_home.php");	
}
	else {
		header("location: file_sharing_new_user.php");
		
}



}
?>
</div>

</body>
</html>
