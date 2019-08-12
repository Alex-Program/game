<?php
$auth = new Auth();
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
    ]);

    exit;
}