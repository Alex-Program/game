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

if ($request['action'] === "create_nick") {
    if (empty($request['nick']) || (empty($request['skin']) && empty($request['password']))) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $skin = new Skin();
    if ($skin->getByNick($request['nick'])) {
        echo json_encode(["result" => "false", "data" => "exists"]);
        exit;
    }


    $skin_id = "";
    if (!empty($request['skin'])) {
        $img = Image::base64Decode($request['skin']);
        if (!$img) {
            echo json_encode(["result" => "false", "data" => "error"]);
            exit;
        }

        $image = new Image();
        $skin_id = $image->addImage($img);
        if (!$skin_id) {
            echo json_encode(["result" => "false", "data" => "error"]);
            exit;
        }
    }


    if ($nick_id = $skin->createNick($request['nick'], $request['password'], $skin_id, USER_ID)) {
        echo json_encode(["result" => "true", "data" => $nick_id], 256);
        exit;
    }

    echo json_encode(["result" => "false", "data" => "error"], 256);
    exit;
}

if ($request['action'] === "change_nick") {
    if (empty($request['id']) || (array_key_exists("nick", $request) && empty($request['nick'])) || (empty($request['password']) && empty($request['skin']))) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $skin = new Skin();
    $nick = $skin->getById($request['id']);
    if (!$nick || $nick['user_id'] != USER_ID) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    if(!empty($request['nick']) && $skin->getByNick($request['nick'])){
        echo json_encode(["result" => "false", "data" => "exists"], 256);
        exit;
    }

    if (!empty($request['skin']) && (int)$request['change_skin']) {
        $img = Image::base64Decode($request['skin']);
        if (!$img) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }

        $image = new Image();
        $skin_id = $image->addImage($img);
        if (!$skin_id) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }
        if (!$skin->updateColumn("skin_id", $skin_id, $request['id'])) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }

    }
    unset($request['skin']);
    unset($request['change_skin']);

    foreach ($request as $key => $value) {
        if (!array_key_exists($key, $nick) || $key == "id" || $value == $nick[$key]) continue;
        if (!$skin->updateColumn($key, $value, $request['id'])) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }
    }

    echo json_encode(["result" => "true", "data" => ""], 256);
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

if($request['action'] == "get_user_stickers"){
    $auth = new Auth();
    $arr = $auth->getUserStickers(USER_ID);

    echo json_encode(["result" => "true", "data" => $arr], 256);
    exit;
}