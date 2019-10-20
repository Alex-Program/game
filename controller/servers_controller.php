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

if($request['action'] == "add_server"){
    if(empty($request['name']) || empty($request['ip'])){
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $id = $server->addServer($request['name'], $request['ip']);
    if(!$id) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $id], 256);
    exit;
}

if($request['action'] == "delete_server"){
    if(empty($request['id'])){
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    if($server->deleteServer($request['id'])){
        echo json_encode(["result" => "true", "data" => ""], 256);
        exit;
    }

    echo json_encode(["result" => "false", "data" => "error"], 256);
    exit;
}