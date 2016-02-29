<!DOCTYPE html>
<html>
<head>
	<link rel="stylesheet" type="text/css" href="file_sharing_site.css">
	<title> Join as a new user </title>
</head>
<body>


<?php session_start();
        if (!isset($_SESSION["user"])){

                header("location: file_sharing_site.php");

}

echo ('So you would like to join the site as "'.$_SESSION['user'].'"?');
echo ('<form action="http://ec2-52-25-221-1.us-west-2.compute.amazonaws.com/file_sharing_new_user.php" method="post">
	Yes:	<input type="radio" name="join_or_nah" value="yes">
<br> No:	<input type="radio" name="join_or_nah" value="no">
	<input type="submit" value="Submit">
	</form>');

if(isset($_POST['join_or_nah'])){
	if($_POST['join_or_nah'] == 'yes'){
		$file_append =	fopen('../user.txt', 'a') or die ("Can't open the file");
		fwrite($file_append, $_SESSION["user"]. PHP_EOL );
		if(fclose($file_append)){
		
			if( mkdir( '/srv/file_sharing_site/'.$_SESSION['user'], 0777, false)){

			echo 'User successfully created';
			echo '<br><a href="file_sharing_user_home.php"> User home </a>';
}
else{
	echo ' Instantiation failed';
}
}
		
}
}
?>
</body>
</html>






<?php
session_start();
require 'news_site_database.php';

if(!isset($_SESSION['user'])){
        header('Location:http://ec2-52-25-221-1.us-west-2.compute.amazonaws.com/news_site_index.php');
}



$story_id = $_GET['id'];

?>



<!DOCTPYPE html>
<html>
<head>
<link rel="stylesheet" type="text/css" href="http://ec2-52-25-221-1.us-west-2.compute.amazonaws.com/news_site.css">
        <title> Join the site</title>
</head>
<body>
<div class="site-title">

<img src="http://basslager.com/wp-content/uploads/2015/09/genius_news_site.png" alt="Genius News Site" 
/>
</div>
<div class="content">

<h1> User Profile </h1>
<HR>

<form action="http://ec2-52-25-221-1.us-west-2.compute.amazonaws.com/file_sharing_new_user.php" method="post">
        New Title:      <input type="text" name="new_title" >
<br> New Description:   <input type="text" name="new_description">
<br> New Link:   <input type="url" name="new_link" >
        <input type="submit" value="Submit">
        </form>

<?php
if(isset($_POST['new_title']) && isset($_POST['new_description']) && isset($_POST['new_link'])){
$new_title = $_POST['new_title'];
$new_description = $_POST['new_description'];
$new_link = $_POST['new_link'];

$stmt_title = $mysqli->prepare("update stories set title=? where id=?");
if(!$stmt_title){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
}

$stmt_title->bind_param('si', $new_title, $story_id);

$stmt_title->execute();
$stmt_title->close();
///////
$stmt_desc = $mysqli->prepare("update stories set description=? where id=?");
if(!$stmt_description){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
}

$stmt_description->bind_param('si', $new_description, $story_id);

$stmt_description->execute();
$stmt_description->close();
////////
$stmt_link = $mysqli->prepare("update stories set link=? where id=?");
if(!$stmt_link){
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
}

$stmt_link->bind_param('si', $new_link, $story_id);

$stmt_link->execute();
$stmt_link->close();



header('Location: http://ec2-52-25-221-1.us-west-2.compute.amazonaws.com/news_site_profile.php');
}
?>

</div>
</body>
</html>
