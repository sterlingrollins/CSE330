<?php
	session_start();
	if (!isset($_SESSION["user"])){
	
		header("location: file_sharing_site.php");
		
	}
?>
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" type="text/css" href="file_sharing_site.css">
	<title>File Sharing Home </title>
</head>
<body>
<div class="home_body">
<?php
	echo "Welcome back, ";
	printf( "%s", htmlentities($_SESSION['user']) );
	$user_files = scandir('/srv/file_sharing_site/'.$_SESSION['user']);

	echo '<br><h1> Click to view files</h1> ';
	foreach($user_files as $file){
	if($file!="."&&$file!=".."){
	echo '<div class="file_holder"><a href="http://ec2-52-25-221-1.us-west-2.compute.amazonaws.com/file_sharing_viewer.php/?file='.$file.'">'. $file. '</a>'.'<a class="download_file" href="file_sharing_downloader.php?download_file='.$file.'"> Download file </a>'.'<a class="delete_file" href="file_sharing_delete_file.php?delete_file='.$file. '"> Delete File </a><br><br></div>';
	}
	}
	echo ('<h2> Upload a file </h2> <form enctype="multipart/form-data" action="file_sharing_uploader.php" method="POST">
	<p>
		<input type="hidden" name="MAX_FILE_SIZE" value="20000000" />
		<label for="uploadfile_input">Choose a file to upload:</label> <input name="uploadedfile" type="file" id="uploadfile_input" />
	</p>
	<p>
		<input type="submit" value="Upload File" />');

	echo ('<br><br><a class="logout_button"  href="file_sharing_logout.php"> Logout </a>');
?>
</div>
</body>
</html>
