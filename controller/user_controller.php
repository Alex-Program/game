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

    $prices = new Prices();
    $prices = $prices->getAllPriceToName();
    $sum = 0;

    $userInfo = $auth->getUserInfo(USER_ID);


    $password = "";
    if (!empty($request['password'])) {
        $password = $request['password'];
        $sum += (int)$prices['create_pass'];
    }

    $isTransparentSkin = 0;
    if ($request['is_transparent_skin'] == 1) {
        $sum += (int)$prices['transparent_skin'];
        $isTransparentSkin = 1;
    }

    $skinId = "";

    if (!empty($request['skin'])) {
        $sum += (int)$prices['create_skin'];
        if ($userInfo['balance'] >= $sum) {
            $image = new Image();
            $skinId = $image->addImgByBase64($request['skin']);

            if (!$skinId) {
                echo json_encode(["result" => "false", "data" => "error"]);
                exit;
            }
        }
    }


    if ($userInfo['balance'] < $sum) {
        echo json_encode(["result" => "false", "data" => "balance"], 256);
        exit;
    }
    if (!$auth->updateColumn("balance", $userInfo['balance'] - $sum, USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }


    if ($nickId = $skin->createNick($request['nick'], $password, $skinId, USER_ID)) {
        echo json_encode(["result" => "true", "data" => $nickId], 256);
        exit;
    }

    echo json_encode(["result" => "false", "data" => "error"], 256);
    exit;
}

if ($request['action'] === "change_nick") {
    if (empty($request['id']) || (array_key_exists("nick", $request) && empty($request['nick']))) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $allowedToChange = ["password", "skin", "is_transparent_skin"]; // разрешено изменять

    $id = $request['id'];


    $skin = new Skin();
    $nickInfo = $skin->getById($request['id']);
    /// если нет ника
    if (!$nickInfo || $nickInfo['user_id'] != USER_ID) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    if ((empty($nickInfo['password']) && $request['remove_skin'] == 1) || (key_exists("password", $request) && empty($request['password']) && empty($nickInfo['skin_id']))) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    /// удаляем не разрешенные поля и одинаковые значения
    foreach ($request as $key => $value) {
        if ($value == $nickInfo[$key] || !in_array($key, $allowedToChange)) unset($request[$key]);
    }


    if (!empty($request['nick']) && $skin->getByNick($request['nick'])) {
        echo json_encode(["result" => "false", "data" => "exists"], 256);
        exit;
    }

    $prices = new Prices();
    $prices = $prices->getAllPriceToName();
    $userInfo = $auth->getUserInfo(USER_ID);
    $sum = 0;

    if (key_exists("password", $request) && !empty($nickInfo['password'])) $sum += (int)$prices['change_pass'];
    else if (!empty($request['password'])) $sum += (int)$prices['create_pass'];

    if (key_exists("is_transparent_skin", $request)) $sum += (int)$prices['transparent_skin'];

    if (!empty($request['skin'])) {
        if (empty($nickInfo['skin_id'])) $sum += (int)$prices['create_skin'];
        else $sum += (int)$prices['change_skin'];

        if ($sum <= $userInfo['balance']) {
            $image = new Image();
            $skinId = $image->addImgByBase64($request['skin']);
            if (!$skinId) {
                echo json_encode(["result" => "false", "data" => "error"], 256);
                exit;
            }
            $request['skin_id'] = $skinId;
        }

    }
    unset($request['skin']);

    if ($userInfo['balance'] < $sum) {
        echo json_encode(["result" => "false", "data" => "balance"], 256);
        exit;
    }

    if (!$auth->updateColumn("balance", $userInfo['balance'] - $sum, USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    foreach ($request as $key => $value) {
        if (!$skin->updateColumn($key, $value, $id)) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }
    }

    echo json_encode(["result" => "true", "data" => $id], 256);
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

if ($request['action'] == "get_user_stickers") {
    $auth = new Auth();
    $arr = $auth->getUserStickers(USER_ID);

    echo json_encode(["result" => "true", "data" => $arr], 256);
    exit;
}


if ($request['action'] === "get_all_prices") {
    $prices = new Prices();
    echo json_encode(["result" => "true", "data" => $prices->getAllPrices()], 256);
    exit;
}