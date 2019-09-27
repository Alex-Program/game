<?php
if ($request['action'] == "get_all_groups") {
    $stickers = new Sticker();
    $arr = $stickers->getAllGroups();
    echo json_encode(["result" => "true", "data" => $arr], 256);
    exit;
}

if ($request['action'] == "add_stickers") {
    if (empty($request['name']) || empty($request['stickers']) || empty($request['group_id'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    if (sizeof($request['stickers']) < 9) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $image = new Image();
    foreach ($request['stickers'] as $key => $sticker) {
        $img = Image::base64Decode($sticker);
        if (!$img) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }

        $imgId = $image->addImage($img);
        if (!$imgId) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }

        $request['stickers'][$key] = $imgId;
    }

    $stickers = new Sticker();
    $stickerId = $stickers->addStickers($request['name'], USER_ID, $request['group_id'], $request['stickers'], 0);
    if (!$stickerId) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $stickerId], 256);
    exit;
}

if($request['action'] == "get_group_stickers"){
    if(empty($request['group_id'])) $request['group_id'] = 0;

    $stickers = new Sticker();
    echo json_encode(["result" => "true", "data" => $stickers->getStickersInGroup($request['group_id'])], 256);
    exit;
}
