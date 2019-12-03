<?php
$server = new Server();

if ($request['action'] == "change_server") {
    if (empty($request['id']) || empty($request['name']) || empty($request['ip'])) {
        echo json_encode(["result" => "false", "data" => 'invalid_request', 256]);
        exit;
    }

    if ($id = $server->changeServer($request['id'], $request['name'], $request['ip'])) {
        echo json_encode(["result" => "true", "data" => $id], 256);
        exit;
    }

    echo json_encode(["result" => "false", "data" => "error"], 256);
    exit;
}

if ($request['action'] == "add_server") {
    if (empty($request['name']) || empty($request['ip'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $id = $server->addServer($request['name'], $request['ip']);
    if (!$id) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $id], 256);
    exit;
}

if ($request['action'] == "delete_server") {
    if (empty($request['id'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    if ($server->deleteServer($request['id'])) {
        echo json_encode(["result" => "true", "data" => ""], 256);
        exit;
    }

    echo json_encode(["result" => "false", "data" => "error"], 256);
    exit;
}

if ($request['action'] == "global_message") {
    if (empty($request['message'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $servers = new Server();
    $allServers = $servers->getAllServers();

    foreach ($allServers as $server) {
        $response = Model::sendPostRequest($server['ip'], ["action" => "global_message", "message" => $request['message']]);
        if (!$response || $response['result'] != "true") {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }
    }

    echo json_encode(["result" => "true", "data" => ""], 256);
    exit;
}


if ($request['action'] == "get_game_settings") {
    if (empty($request['id'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $servers = new Server();
    $serverInfo = $servers->getById($request['id']);
    if (!$serverInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    $response = Model::sendPostRequest($serverInfo['ip'], ["action" => "get_game_settings"]);
    if ($response['result'] !== "true") {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $response['data']]);
    exit;
}

if ($request['action'] === "update_game_settings") {
    if (empty($request['id'])) {
        echo json_encode(["result" => "true", "data" => "invalid_request"], 256);
        exit;
    }

    $servers = new Server();
    $serverInfo = $servers->getById($request['id']);
    if (!$serverInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }
    unset($request['action']);
    unset($request['id']);

    $response = Model::sendPostRequest($serverInfo['ip'], array_merge($request, ["action" => "update_game_settings"]));
    if (!$response || $response['result'] !== "true") {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => ""], 256);
    exit;
}