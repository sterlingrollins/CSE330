<?PHP

session_start();
session_destroy();
header("Location: file_sharing_site.php");
?>
