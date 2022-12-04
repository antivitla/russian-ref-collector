<?php

include 'util.save.php';

// Parse params: url, type, saveTo
if (!$_REQUEST['url']) {
  http_response_code(400);
  throw new Error('\'url\' param required');
}
$url = $_REQUEST['url'];
$type = $_REQUEST['type'] ?: 'text';
$saveTo = $_REQUEST['saveTo'] ? '../' . $_REQUEST['saveTo'] : null;

// Fetch image or page
$ch = curl_init();
if ($type == 'image') {
  curl_setopt_array($ch, array(
    CURLOPT_URL => $url,
    CURLOPT_HEADER => 0,
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_BINARYTRANSFER => 1,
    CURLOPT_USERAGENT => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0) Collector of Z Heroes'
  ));
} else {
  curl_setopt_array($ch, array(
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_FOLLOWLOCATION => 1,
    CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
    CURLOPT_CONNECTTIMEOUT => 40000,
    CURLOPT_ENCODING => 'UTF-8',
    CURLOPT_REFERER => parse_url($url)['host'],
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.143 YaBrowser/22.5.0.1885 Yowser/2.5 Safari/537.3 Z Heroes Collector'
  ));
}
$result = curl_exec($ch);
if (!$result) {
  http_response_code(500);
  throw new Error(curl_error($ch));
}
curl_close($ch);

// Save, if needed and return
if ($saveTo) {
  utilSave($saveTo, $result);
}

// Response
http_response_code(200);
if ($type == 'text') {
  echo $result;
}

?>