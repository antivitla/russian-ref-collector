<?php

function utilSave ($saveTo, $saveData, $dataType = 'plain') {
  // Delete existing file
  if (file_exists($saveTo)) {
    unlink($saveTo);
  }

  // Create folder, if needed
  $path = implode(array_slice(explode('/', $saveTo), 0, -1), '/');
  if (!file_exists($path)) {
    mkdir($path, 0777, true);
  }

  // Save data
  if ($dataType == 'file') {
    move_uploaded_file($saveData, $saveTo);
  } else {
    $fp = fopen($saveTo, 'x');
    fwrite($fp, $saveData);
    fclose($fp);
  }
}

?>