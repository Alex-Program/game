<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="/src/js/jquery-3.3.1.js"></script>
    <script src="/src/js/functions.js"></script>
    <script src="/src/js/Notify.js"></script>
    <script src="/src/js/Ws.js"></script>
    <script src="/src/js/header.js"></script>
    <link rel="stylesheet" href="/vendor/bootstrap/css/bootstrap.css">
    <link rel="stylesheet" href="/src/css/whole.css">
    <link rel="stylesheet" href="/src/css/header.css">
</head>
<body>

<!--<div id="header">-->
<!--    <div>-->
<!--        <div style="flex-grow: 1;">-->
<!---->
<!--        </div>-->
<!--        <div id="user_info">-->
<!--            <div id="user_info_header">-->
<!--                <div style="border-radius: 20px; overflow: hidden">-->
<!--                    <img src="/src/images/user_img.png" style="width: 40px; height: 40px;" alt="" class="user_img">-->
<!--                </div>-->
<!--                <div style="position: relative; display: flex; flex-direction: column;">-->
<!--                    <div style="flex-grow: 1;"></div>-->
<!--                    <span class="user_name" style="flex: 0 1 auto;"></span>-->
<!--                    <div style="flex-grow: 1;"></div>-->
<!--                </div>-->
<!--            </div>-->
<!--            <div id="user_info_slide" class="closed">-->
<!--                <a href="/cabinet">-->
<!--                    <div>wefwef</div>-->
<!--                </a>-->
<!--                <a href="/cabinet">-->
<!--                    <div>wefwefewgwgewg</div>-->
<!--                </a>-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--</div>-->
<div id="open_menu">
    <img src="/src/images/burger.png">
</div>
<div id="main_menu" class="closed">
    <div data-href="cabinet" class="menu_href">Личный кабинет</div>
    <div data-href="skins" class="menu_href">Ники</div>
    <div data-href="stickers" class="menu_href">Магазин стикеров</div>
    <div data-href="skin_editor" class="menu_href">Редактор скинов</div>
</div>

<div id="preloader" class="closed">
    <div></div>
</div>

<div id="image_preview" class="flex_row closed">
    <img src="" alt="">
</div>