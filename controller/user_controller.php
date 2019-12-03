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

if ($request['action'] == "transfer_balance") {
    if (empty($request['recipient_id']) || empty((int)$request['sum']) || $request['sum'] < 1) {
        echo json_encode(["result" => "false", "data" => 'invalid_request'], 256);
        exit;
    }

    if ($request['recipient_id'] == USER_ID) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    $targetUserInfo = $auth->getUserInfo($request['recipient_id']);
    if (!$targetUserInfo) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    $transferSum = (int)$request['sum'];
    $totalSum = floor($transferSum * 1.1);

    $currentUserInfo = $auth->getUserInfo(USER_ID);
    if ($currentUserInfo['balance'] < $totalSum) {
        echo json_encode(["result" => "false", "data" => "balance"], 256);
        exit;
    }

    if (!$auth->addBalance(-$totalSum, USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    if (!$auth->addBalance($transferSum, $request['recipient_id'])) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $currentUserInfo['balance'] - $totalSum], 256);
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

if ($request['action'] == "change_user_image") {
    if (empty($request['img'])) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $image = new Image();
    $imageId = $image->addImgByBase64($request['img']);
    if (!$imageId) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    if (!$auth->updateColumn("image_id", $imageId, USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $image->getPath($imageId)], 256);
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
    $isClan = false;
    if (key_exists("is_clan", $request) && $request['is_clan'] == 1) $isClan = true;
    $clanPrice = $isClan ? "clan_" : "";

    $skin = new Skin();
    if ($skin->getByNick($request['nick'], false, $isClan)) {
        echo json_encode(["result" => "false", "data" => "exists"]);
        exit;
    }

    $prices = new Prices();
    $prices = $prices->getAllPriceToName();
    $sum = 0;

    $userInfo = $auth->getUserInfo(USER_ID);
    $totalBalance = $userInfo['balance'] + $userInfo['bonus_balance'];

    $password = "";
    if (!empty($request['password'])) {
        $password = $request['password'];
        $sum += (int)$prices[$clanPrice . 'create_pass'];
    }

    $isTransparentSkin = 0;
    if ($request['is_transparent_skin'] == 1) {
        $sum += (int)$prices[$clanPrice . 'transparent_skin'];
        $isTransparentSkin = 1;
    }

    $isTurningSkin = 0;
    if ($request['is_turning_skin'] == 1) {
        $sum += (int)$prices[$clanPrice . 'turning_skin'];
        $isTurningSkin = 1;
    }

    $isInvisibleNick = 0;
    if ($request['is_invisible_nick'] == 1) {
        $sum += (int)$prices[$clanPrice . 'invisible_nick'];
        $isInvisibleNick = 1;
    }

    $isRandomColor = 0;
    if ($request['is_random_color'] == 1) {
        $sum += (int)$prices[$clanPrice . 'random_color'];
        $isRandomColor = 1;
    }

    $skinId = "";

    if (!empty($request['skin'])) {
        $sum += (int)$prices[$clanPrice . 'create_skin'];
        if ($totalBalance >= $sum) {
            $image = new Image();
            $skinId = $image->addImgByBase64($request['skin']);

            if (!$skinId) {
                echo json_encode(["result" => "false", "data" => "error"]);
                exit;
            }
        }
    }


    if ($totalBalance < $sum) {
        echo json_encode(["result" => "false", "data" => "balance"], 256);
        exit;
    }
    $bonusBalance = $sum <= $userInfo['bonus_balance'] ? $sum : $userInfo['bonus_balance'];
    if ($bonusBalance > 0 && !$auth->addBonusBalance(-$bonusBalance, USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    $balance = $sum - $bonusBalance;
    if ($balance > 0 && !$auth->addBalance(-$balance, USER_ID)) {
        echo json_encode(["result" => "true", "data" => "error"], 256);
        exit;
    }


    if ($nickId = $skin->createNick($request['nick'], $password, $skinId, USER_ID, $isTransparentSkin, $isTurningSkin, $isInvisibleNick, $isRandomColor, $isClan)) {
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

    $allowedToChange = ["password", "skin", "is_transparent_skin", "is_turning_skin", "is_invisible_nick", "is_random_color"]; // разрешено изменять

    $id = $request['id'];

    $skin = new Skin();
    $nickInfo = $skin->getById($request['id']);
    /// если нет ника
    if (!$nickInfo || $nickInfo['user_id'] != USER_ID) {
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    $isClan = $nickInfo['is_clan'] == 1 ? true : false;
    $clanPrice = $isClan ? "clan_" : "";

    if ((empty($nickInfo['password']) && $request['remove_skin'] == 1) || (key_exists("password", $request) && empty($request['password']) && empty($nickInfo['skin_id']))) {
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    /// удаляем не разрешенные поля и одинаковые значения
    foreach ($request as $key => $value) {
        if ($value == $nickInfo[$key] || !in_array($key, $allowedToChange)) unset($request[$key]);
    }


    if (!empty($request['nick']) && $skin->getByNick($request['nick'], false, $isClan)) {
        echo json_encode(["result" => "false", "data" => "exists"], 256);
        exit;
    }

    $prices = new Prices();
    $prices = $prices->getAllPriceToName();
    $userInfo = $auth->getUserInfo(USER_ID);
    $totalBalance = $userInfo['balance'] + $userInfo['bonus_balance'];
    $sum = 0;

    if (key_exists("password", $request) && !empty($nickInfo['password'])) $sum += (int)$prices[$clanPrice . 'change_pass'];
    else if (!empty($request['password'])) $sum += (int)$prices[$clanPrice . 'create_pass'];

    if (key_exists("is_transparent_skin", $request)) {
        $sum += (int)$prices[$clanPrice . 'transparent_skin'];
        $request['is_transparent_skin'] = (int)$request['is_transparent_skin'];
    }
    if (key_exists("is_turning_skin", $request)) {
        $sum += (int)$prices[$clanPrice . 'turning_skin'];
        $request['is_turning_skin'] = (int)$request['is_turning_skin'];
    }
    if (key_exists("is_invisible_nick", $request)) {
        $sum += (int)$prices[$clanPrice . 'invisible_nick'];
        $request['is_invisible_nick'] = (int)$request['is_invisible_nick'];
    }
    if (key_exists("is_random_color", $request)) {
        $sum += (int)$prices[$clanPrice . 'random_color'];
        $request['is_random_color'] = (int)$request['is_random_color'];
    }

    if (!empty($request['skin'])) {
        if (empty($nickInfo['skin_id'])) $sum += (int)$prices[$clanPrice . 'create_skin'];
        else $sum += (int)$prices[$clanPrice . 'change_skin'];

        if ($sum <= $totalBalance) {
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

    if ($totalBalance < $sum) {
        echo json_encode(["result" => "false", "data" => "balance"], 256);
        exit;
    }

    $bonusBalance = $sum <= $userInfo['bonus_balance'] ? $sum : $userInfo['bonus_balance'];
    if ($bonusBalance > 0 && !$auth->addBonusBalance(-$bonusBalance, USER_ID)) {
        echo json_encode(["result" => "false", "data" => "error"], 256);
        exit;
    }

    $balance = $sum - $bonusBalance;
    if ($balance > 0 && !$auth->addBalance(-$balance, USER_ID)) {
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