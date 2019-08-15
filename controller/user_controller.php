<?php

$auth = new Auth();
if ($request['action'] == "get_user_info") {
    $userInfo = $auth->getUserInfo(USER_ID);
    if (!$userInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_user"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $userInfo], 256);
    exit;
}

if ($request['action'] == "change_user_name") {
    if (empty($request['name'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $userInfo = $auth->getUserInfo(USER_ID);
    if ($request['name'] == $userInfo['name']) {
        echo json_encode(["result" => "true", "data" => $request['name']], 256);
        exit;
    }

    $byName = $auth->getByUserName($request['name']);
    if ($byName) {
        echo json_encode(["result" => "false", "data" => "exists"], 256);
        exit;
    }

    if (!$auth->updateUserInfo("name", $request['name'], USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $request['name']]);
    exit;
}

if ($request['action'] == "get_user_skins") {
    $skin = new Skin();

    $allSkins = $skin->getSkinsByUserId(USER_ID);
    echo json_encode(["result" => "true", "data" => $allSkins], 256);
    exit;
}

if ($_POST['action'] == "change_user_img") {
    if (empty($_FILES['file']['tmp_name'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $ext = end(explode(".", $_FILES['file']['name']));

    if (!is_dir("../src/users_img")) @mkdir("../src/users_img");

    $name = USER_ID . "." . $ext;
    if (!move_uploaded_file($_FILES['file']['tmp_name'], "../src/users_img/" . $name)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    if (!$auth->updateUserInfo("img", "/src/users_img/" . $name, USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => "/src/users_img/" . $name]);
    exit;
}
