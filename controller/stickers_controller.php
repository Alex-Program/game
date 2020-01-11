<?php
if ($request['action'] == "get_all_groups") {
    $stickers = new Sticker();
    $arr = $stickers->getAllGroups();
    echo json_encode(["result" => "true", "data" => $arr], 256);
    exit;
}

if ($request['action'] == "add_stickers") {
    if (empty($request['name']) || empty($request['stickers']) || empty($request['group_id']) || empty($request['price'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    if (sizeof($request['stickers']) < 9) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $image = new Image();
    foreach ($request['stickers'] as $key => $sticker) {
        $imgId = $image->addImgByBase64($sticker);

        if (!$imgId) {
            echo json_encode(["result" => "false", "data" => "error"], 256);
            exit;
        }

        $request['stickers'][$key] = $imgId;
    }

    $stickers = new Sticker();
    $stickerId = $stickers->addStickers($request['name'], USER_ID, $request['group_id'], $request['stickers'], $request['price'], 0);
    if (!$stickerId) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $stickerId], 256);
    exit;
}

if ($request['action'] == "get_group_stickers") {
    if (empty($request['group_id'])) $request['group_id'] = 0;

    if($request['group_id'] == -1){
        $stickers = $auth->getUserStickers(USER_ID);
        echo json_encode(["result" => "true", "data" => $stickers]);
        exit;
    }

    $stickers = new Sticker();
    echo json_encode(["result" => "true", "data" => $stickers->getStickersInGroup($request['group_id'])], 256);
    exit;
}

if ($request['action'] == "buy_stickers") {
    if (empty($request['id'])) {
        echo json_encode(["result" => "false", "data" => 'invalid_request'], 256);
        exit;
    }

    $stickers = new Sticker();
    $stickerInfo = $stickers->getStickerSet($request['id']);
    if (!$stickerInfo || $stickerInfo['is_valid'] == 0) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    $userInfo = $auth->getUserInfo(USER_ID);
    if (in_array($request['id'], $userInfo['stickers'])) {
        echo json_encode(["result" => "false", "data" => "exists"], 256);
        exit;
    }
    if ($userInfo['balance'] < $stickerInfo['price']) {
        echo json_encode(["result" => "false", "data" => "balance"], 256);
        exit;
    }

    if (!$auth->addBalance(-$stickerInfo['price'], USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    $userStickers = $userInfo['stickers'];
    array_push($userStickers, (int)$stickerInfo['id']);
    if (!$auth->updateColumn("stickers", json_encode($userStickers, 256), USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $stickerInfo['id']], 256);
    exit;

}
