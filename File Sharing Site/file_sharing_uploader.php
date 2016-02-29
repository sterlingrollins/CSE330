<?php
session_start();

    if (!isset($_SESSION["user"])){

                header("location: file_sharing_site.php");

}
 
// Get the filename and make sure it is valid
$filename = basename($_FILES['uploadedfile']['name']);
if( !preg_match('/^[\w_\.\-]+$/', $filename) ){
	echo "Invalid filename";
	exit;
}
 
// Get the username and make sure it is valid
$username = $_SESSION['user'];
if( !preg_match('/^[\w_\-]+$/', $username) ){
	echo "Invalid username";
	exit;
}
 
$full_path = sprintf("/srv/file_sharing_site/%s/%s", $username, $filename);
 
if( move_uploaded_file($_FILES['uploadedfile']['tmp_name'], $full_path) ){
	header("Location: upload_success.html");
	exit;
}else{
	header("Location: upload_failure.html");
	exit;
}
 
?>
