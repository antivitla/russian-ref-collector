<?php 

// Parse params: url
if (!$_REQUEST['url']) {
  http_response_code(400);
  throw new Error('\'url\' param required');
}
$url = $_REQUEST['url'];

// Parse Content-Type
$contentType = apache_request_headers()['Content-Type'];
if (!$contentType) {
  $contentType = 'application/x-www-form-urlencoded';
}

$ch = curl_init();
curl_setopt_array($ch, array(
  CURLOPT_URL => $url,
  CURLOPT_POST => 1,
  CURLOPT_POSTFIELDS => file_get_contents('php://input'),
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => 'UTF-8',
  CURLOPT_USERAGENT => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0) Collector Z Heroes',
  CURLOPT_HEADER => array(
    'Content-Type: ' . $contentType
  )
));
$result = curl_exec($ch);
if (!$result) {
  http_response_code(500);
  throw new Error(curl_error($ch));
}
curl_close($ch);

// Response
http_response_code(200);
echo $result;

?>

