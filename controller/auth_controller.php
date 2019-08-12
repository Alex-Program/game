<?php
$headers = getallheaders();
$token = $headers['Token'] ? $headers['Token'] : $_COOKIE['Token'];
$userId = $headers['User-Id'] ? $headers['User-Id'] : $_COOKIE['User-Id'];
if (!$token || !$userId) return;

$auth = new Auth();
$userInfo = $auth->authByToken($userId, $token);
if (!$userInfo) return;

$isAuth = true;
define("USER_ID", $userInfo['id']);