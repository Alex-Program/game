<?php
$prices = new Prices();
if ($request['action'] === "change_price") {
    if (empty($request['name'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    if (empty($request['price'])) $request['price'] = 0;

    if ($prices->updatePrice($request['name'], $request['price'])) {
        echo json_encode(["result" => "true", "data" => $request['name']], 256);
        exit;
    }

    echo json_encode(["result" => "false", "data" => "error"], 256);
    exit;
}

