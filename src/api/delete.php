<?php

// include 'util.save.php';

// Parse params: deleteFrom
if (!$_REQUEST['deleteFrom']) {
  http_response_code(400);
  throw new Error('\'deleteFrom\' param required');
}
$deleteFrom = '../' . $_REQUEST['deleteFrom'];

// Delete existing file
if (file_exists($deleteFrom)) {
  unlink($deleteFrom);
}

// Response
http_response_code(200);
echo 'Deleted!';

?>