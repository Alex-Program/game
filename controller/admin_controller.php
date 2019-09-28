<?php
if(!ADMIN) exit;

if($request['action'] == "get_nick"){
    if(empty($request['nick'])){
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $skin = new Skin();
    $nick = $skin->getByNick($request['nick']);
    if(!$nick){
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $nick], 256);
    exit;
}

if($request['action'] == "get_sticker_set"){
    if(empty($request['id'])){
        echo json_encode(["result" => "false", "data" => "invalid_request"], 256);
        exit;
    }

    $stickers = new Sticker();
    $arr = $stickers->getStickerSet($request['id']);
    if(!$arr){
        echo json_encode(["result" => "false", "data" => "invalid_data"], 256);
        exit;
    }

    echo json_encode(["result" => "true", "data" => $arr], 256);
    exit;
}