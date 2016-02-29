<?php

session_start();
        if (!isset($_SESSION["user"])){

                header("location: file_sharing_site.php");

        }

$filename = $_GET['download_file'];


if( !preg_match('/^[\w_\.\-]+$/', $filename) ){
        echo "Invalid filename";
        exit;
}

// Get the username and make sure that it is alphanumeric with limited other characters.
// You shouldn't allow usernames with unusual characters anyway, but it's always best to perform a sanity check
// since we will be concatenating the string to load files from the filesystem.
$username = $_SESSION['user'];
if( !preg_match('/^[\w_\-]+$/', $username) ){
        echo "Invalid username";
        exit;
}

$full_path = sprintf("/srv/file_sharing_site/%s/%s", $username, $filename);


$file = $full_path;

if (file_exists($file)) {
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="'.basename($file).'"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}
?>
