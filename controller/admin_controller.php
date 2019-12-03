<?php
if (!ADMIN) exit;

if ($request['action'] == "get_nick") {
    if (empty($request['nick'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $isClan = $request['is_clan'] == 1;

    $skin = new Skin();
    $nick = $skin->getByNick($request['nick'], true, $isClan);
    if (!$nick) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $nick], 256);
    exit;
}

if ($request['action'] == "get_sticker_set") {
    if (empty($request['id'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $stickers = new Sticker();
    $arr = $stickers->getStickerSet($request['id']);
    if (!$arr) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $arr], 256);
    exit;
}

if ($request['action'] == "get_account_info") {
    if (empty($request['token']) || empty($request['userId'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $userInfo = $auth->authByToken($request['userId'], $request['token']);
    if (!$userInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $userInfo], 256);
    exit;
}

if ($request['action'] == "add_experience") {
    if (empty($request['userId']) || empty($request['experience'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $auth = new Auth();
    $userInfo = $auth->getUserInfo($request['userId']);
    if (!$userInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }


}

if ($request['action'] == "ban_account") {
    if (empty($request['id'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $auth = new Auth();
    $userInfo = $auth->getUserInfo($request['id']);
    if (!$userInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    if ($auth->updateColumn("is_banned", "1", $request['id'])) {
        echo json_encode(["result" => "true", "data" => $request['id']], 256);
        exit;
    }

    echo json_encode(["result" => "false", "data" => "error"], 256);
    exit;
}


if ($request['action'] == "get_all_nicks") {
    $skin = new Skin();
    $arr = $skin->getAllNicks();
    echo json_encode(["result" => "true", "data" => $arr], 256);
    exit;
}

if ($request['action'] == "update_nick") {
    if (empty($request['id'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $allowedFields = ["nick", "password", "user_id", "is_admin", "is_moder", "is_helper", "is_gold", "is_transparent_skin", "is_turning_skin", "is_invisible_nick", "is_random_color", "is_violet"];
    $id = $request['id'];
    foreach ($request as $name => $value) {
        if (!in_array($name, $allowedFields)) unset($request[$name]);
    }
    if (empty($request)) {
        echo json_encode(["result" => "true", "data" => $id]);
        exit;
    }

    if (!empty($request['user_id']) && !$auth->getUserInfo($request['user_id'])) {
        echo json_encode(["result" => "false", "data" => "invalid_user"], 256);
        exit;
    }

    $isClan = $request['is_clan'] == 1;

    $skin = new Skin();

    if (!empty($request['nick'])) {
        $nickInfo = $skin->getByNick($request['nick'], true, $isClan);
        if ($nickInfo && $nickInfo['id'] != $request['id']) {
            echo json_encode(["result" => "false", "data" => "nick_exists"], 256);
            exit;
        }
    }

    foreach ($request as $name => $value) {
        if (!$skin->updateColumn($name, $value, $id)) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }
    }

    echo json_encode(["result" => "true", "data" => $id], 256);
    exit;

}