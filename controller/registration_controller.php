<?php
$auth = new Auth();

if ($request['action'] == "registration") {
    if (empty($request['password']) || empty($request['name'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $userId = $auth->registration(Model::cryptByKey($request['password'], Auth::KEY), $request['name']);
    if (!$userId) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    $token = Model::generateHash();
    if (!$auth->updateToken($userId, $token)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" =>
        [
            "user_id" => $userId,
            "token" => $token
        ]
    ], 256);
    exit;
}

if ($request['action'] == "auth") {
    if (empty($request['user_id']) || empty($request['password'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $userInfo = $auth->authByPass($request['user_id'], Model::cryptByKey($request['password'], Auth::KEY));
    if (!$userInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    $token = Model::generateHash();
    if (!$auth->updateToken($request['user_id'], $token)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" =>
        [
            "user_id" => $userInfo['id'],
            "token" => $token
        ]
    ], 256);

    exit;
}

if ($request['action'] == "auth_by_token") {
    if (empty($request['token']) || empty($request['user_id'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $auth = new Auth();
    $userInfo = $auth->authByToken($request['user_id'], $request['token']);
    if (!$userInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" =>
        [
            "user_id" => $userInfo['id'],
            "token" => $userInfo['token']
        ]
    ], 256);
    exit;
}

if ($request['action'] == "get_nick") {
    if (empty($request['nick'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $skins = new Skin();
    $nick = $skins->getByNick($request['nick']);
    if (!$nick) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $nick], 256);
    exit;
}