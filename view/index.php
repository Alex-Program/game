<script src="/src/js/jquery-3.3.1.js"></script>
<script src="/src/js/functions.js"></script>
<script src="/src/js/Notify.js"></script>
<script src="/src/js/Ws.js"></script>
<link rel="stylesheet" href="../src/css/index.css">

<canvas id="canvas">

</canvas>

<div id="ping"></div>

<div id="coords">

</div>

<div id="open_chat" class="closed">
    <img src="/src/images/chat.png" alt="Чат">
</div>

<div id="main_messages">
    <div id="chat_settings">
        <img src="/src/images/clear_chat.png" style="width: 25px; cursor: pointer;" id="clear_chat">
        <div id="resize_chat"></div>
        <div id="close_chat">x</div>
    </div>
    <div id="all_messages">

    </div>
    <div id="send_message">
        <input type="hidden" id="pm_id" value="">
        <div id="chat_service" class="closed"></div>
        <input type="text" id="message_text">
    </div>
</div>

<input type="hidden" id="selected_chat_user" value="">
<div class="user_actions admin closed">
    <div></div>
    <div>Забанить IP</div>
    <div>Кикнуть</div>
    <div>Мут</div>
</div>

<div class="user_actions user closed">
    <div></div>
    <div>Не показывать сообщения</div>
    <div>Выделять сообщения</div>
</div>

<div id="main_menu">
    <div style="display: flex; justify-content: center">
        <div id="login">
            <div>
                <div>
                    <input type="text" class="red_input">
                </div>
                <div>
                    <input type="text" class="red_input">
                </div>
            </div>
            <div style="display: flex; justify-content: center;">
                <button class="button button_primary">Войти</button>
            </div>
        </div>
    </div>
    <div style="position: relative; display: flex; flex-direction: row;">
        <div style="flex: 1 1 auto;">
            <div class="triangle left" style="float: left;">
                <img src="/src/images/triangle.png">
                <div>Магазин</div>
            </div>
            <div class="triangle left" style="float: left; clear: both;">
                <img src="/src/images/triangle.png">
            </div>
        </div>
        <div style="flex: 1 1 auto;">
            <div class="triangle right" style="float: right;">
                <img src="/src/images/triangle.png">
                <div>Личный кабинет</div>
            </div>
            <div class="triangle right" style="float: right; clear: both;">
                <img src="/src/images/triangle.png">
            </div>
        </div>
    </div>

    <img id="play_button" src="/src/images/play_button.jpg">


    <div id="servers_list">
        <div>
            wefwef
        </div>
    </div>
</div>
<!--<script defer src="src/js/pixi.js"></script>-->
<script defer src="../src/js/index.js"></script>
<script defer src="../src/js/game.js"></script>
