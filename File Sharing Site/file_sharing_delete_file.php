<?php


session_start();
if (!isset($_SESSION["user"])){

                header("location: file_sharing_site.php");

        }

$delete_file = $_GET["delete_file"];


if(unlink('/srv/file_sharing_site/'.$_SESSION['user'].'/'.$delete_file)){


echo 'File sucessfully deleted ' ;
header("Location: file_sharing_user_home.php");


}


?>
