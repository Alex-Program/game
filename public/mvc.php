<?php
header('Access-Control-Allow-Origin: *');
//ini_set("display_errors", false);
//error_reporting(E_ALL & ~E_NOTICE);

function modelAutoload($className)
{
    include_once __DIR__ . '/../model/' . $className . '.php';
}

spl_autoload_register('modelAutoload', true, true);

date_default_timezone_set('UTC');


$uri = explode("?", $_SERVER['REQUEST_URI'])[0];
if (mb_substr($uri, -1, 1, "UTF-8") == "/") {
    $uri = mb_substr($uri, 0, -1, "UTF-8");
}
$pages = explode("/", $uri);


$api = false;

$page = $pages[count($pages) - 1];
if ($pages[count($pages) - 2] == "api") $api = true;

if (empty($page)) $page = "index";


$isAuth = false;

require('../controller/auth_controller.php');

if ($api) {
    if (!$isAuth && $page != "registration") {
        echo json_encode(["result" => "false", "data" => "invalid_token"], 256);
        exit;
    }
    if (!file_exists("../controller/" . $page . "_controller.php") || $page == "auth") {
        echo json_encode(["result" => "false", "data" => "invalid_page"], 256);
        exit;
    }

    $request = [];
    if (!empty($_POST['json'])) $request = json_decode($_POST['json'], true);

    require("../controller/" . $page . "_controller.php");

    exit;
}

if (!file_exists("../view/" . $page . ".php")) {
    header("Location: /");
    exit;
}

if ($page == "index") {
    require("../view/index.php");
    exit;
}

if (!$isAuth && $page != "sign") {
    header("Location: /");
    exit;
}

if ($isAuth && $page == "sign") {
    header("Location: cabinet");
    exit;
}

if ($page == "sign") {
    require("../view/sign.php");
    exit;
}


require('../view/header.php');
require("../view/" . $page . ".php");
require("../view/header_bottom.php");