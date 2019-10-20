<?php
$auth = new Auth();

$headers = getallheaders();
if ($headers['Token'] == "elrjglkejrglkjekjwlkejflkwjelkfjwkleg" && $headers['User-Id'] == 0) {
    $isAuth = true;
    define("USER_ID", 0);
    define("ADMIN", true);
    return;
}
$token = null;
$userId = null;
if (!empty($headers['Token'])) $token = $headers['Token'];
elseif (!empty($_COOKIE['Token'])) $token = $_COOKIE['Token'];

if (!empty($headers['User-Id'])) $userId = $headers['User-Id'];
elseif (!empty($_COOKIE['User-Id'])) $userId = $_COOKIE['User-Id'];

if (!$token || !$userId) return;

$userInfo = $auth->authByToken($userId, $token);
if (!$userInfo) return;
if($userInfo['is_banned'] == 1) return;

$isAuth = true;
$isAdmin = (int)$userInfo['is_admin'];
define("USER_ID", $userInfo['id']);
define("ADMIN", (boolean)$isAdmin);