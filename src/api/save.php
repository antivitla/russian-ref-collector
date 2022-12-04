<?php

include 'util.save.php';

// Parse params: saveTo
if (!$_REQUEST['saveTo']) {
  http_response_code(400);
  throw new Error('\'saveTo\' param required');
}
$saveTo = '../' . $_REQUEST['saveTo'];

// Parse files or body
if ($_FILES['files']) {
  $saveData = $_FILES['files']['tmp_name'][0];
  $dataType = 'file';
} else if (file_get_contents('php://input')) {
  $saveData = file_get_contents('php://input');
  $dataType = 'plain';
} else {
  http_response_code(400);
  throw new Error('No data for saving provided!');
}

// Save
utilSave($saveTo, $saveData, $dataType);

// Response
http_response_code(200);
echo 'Saved!';

?>