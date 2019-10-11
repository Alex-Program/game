<script src="/src/js/jquery-3.3.1.js"></script>
<script src="/src/js/functions.js"></script>
<script src="/src/js/Notify.js"></script>
<script src="/src/js/Ws.js"></script>
<link href="https://fonts.googleapis.com/css?family=Special+Elite&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css?family=Caveat&display=swap" rel="stylesheet">
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

<div id="top_players">

</div>

<input type="hidden" id="selected_chat_user" value="">
<input type="hidden" id="selected_chat_nick" value="">
<div class="user_actions admin closed">
    <div></div>
    <div>Забанить IP</div>
    <div>Кикнуть</div>
    <div>Мут</div>
    <div>Снизить массу</div>
</div>

<div class="user_actions user closed">
    <div></div>
    <div>Не показывать сообщения</div>
    <div>Выделять сообщения</div>
    <div>Написать ЛС</div>
    <div>Обратиться</div>
    <div>Скопировать ник</div>
</div>

<div id="online_players" class="closed">
    <h2 style="padding: 10px; display: flex; flex-direction: row;">Игроки онлайн <span class="total_players"></span>
    </h2>
    <div>

    </div>
</div>

<div id="main_menu">
    <div style="display: flex; justify-content: center">
        <div id="login">
            <div>
                <div>
                    <input type="text" class="red_input" id="login_sign_in" placeholder="ИД">
                </div>
                <div>
                    <input type="text" class="red_input" id="password_sign_in" placeholder="Пароль">
                </div>
            </div>
            <div style="display: flex; justify-content: center;">
                <button class="button button_primary" id="sign_in_button">Войти</button>
            </div>
        </div>
        <div id="account_div" style="display: none; position: relative;">
            <div class="flex_row" style="z-index: 2;">
                <img src="">
                <div class="user_name"></div>
                <div id="add_balance_div">
                    <div class="user_balance"></div>
                    <div id="add_balance">+</div>
                </div>
            </div>
            <div id="exit_button" class="closed">ВЫЙТИ</div>
        </div>
    </div>
    <div style="position: relative; display: flex; flex-direction: row; margin-left:10px; margin-right: 10px;">
        <div style="flex: 1 1 auto;">
            <div class="triangle left for_user closed" style="float: left;">
                <!--                <img src="/src/images/triangle.png">-->
                <svg width="70" height="70">
                    <polygon points="5,70 35,5 65,70"
                             fill="red" stroke="red" stroke-width="5"/>
                </svg>

                <div class="button_label">Магазин</div>
            </div>
            <div class="triangle left for_user closed" style="float: left; clear: both; margin-top: 10px;">
                <svg width="70" height="70">
                    <polygon points="5,70 35,5 65,70"
                             fill="red" stroke="red" stroke-width="5"/>
                </svg>
            </div>
        </div>
        <div style="flex: 1 1 auto;">
            <div class="triangle right" style="float: right;" id="personal_account">
                <div class="button_label">Личный<br> кабинет</div>
                <svg width="70" height="70">
                    <polygon points="5,70 35,5 65,70"
                             fill="red" stroke="red" stroke-width="5"/>
                </svg>

            </div>
            <div class="triangle right for_user closed" style="float: right; clear: both; margin-top: 10px;">
                <svg width="70" height="70">
                    <polygon points="5,70 35,5 65,70"
                             fill="red" stroke="red" stroke-width="5"/>
                </svg>
            </div>
        </div>
    </div>

    <!--    <img id="play_button" src="/src/images/play_button.jpg">-->
    <div id="play_button">PLAY</div>


    <div id="servers_list">
        <div id="servers_header">
            <div style="position: relative; width: 100%; height: 100%;">
                <div id="collapse_servers">▼</div>
            </div>
        </div>
        <div style="display: flex; flex-direction: row; border: dashed 3px gold; padding: 5px; background: lightseagreen; border-radius: 5px;">
            <div style="position: relative;" class="flex_row">
                <span class="label_input">Ник:</span>
                <div style="position: relative; margin-left: 10px;">
                    <input type="text" class="gold_input" placeholder="Ник" id="nick_for_game">
                    <div id="select_nick" class="closed">
                        <div class="html"></div>
                        <div class="html local"></div>
                    </div>
                </div>
            </div>
            <div style="margin-left: 10px;" class="flex_row">
                <span class="label_input">Пароль:</span>
                <input type="text" class="gold_input" placeholder="Пароль" id="password_for_game">
            </div>
        </div>
        <div class="flex" style="margin-top: 10px; padding-top: 5px;">
            <input type="color" id="select_color" style="display: none;" value="#FFD700">
            <span class="label_input">Цвет:</span>
            <span id="color_preview" style="color: black; background: #FFD700;">#FFD700</span>
        </div>
        <div style="display: flex; justify-content: center;">
            <img id="skin_preview" class="closed">
        </div>
        <div>
            <h2 class="h2">Выберите сервер</h2>
            <div style="display: flex; flex-direction: row;">
                <div style="padding: 10px;">
                                                            <div class="server" data-ip="178.21.8.10:8081">178.21.8.10:8081</div>
<!--                    <div class="server" data-ip="127.0.0.1:8081">178.21.8.10:8081</div>-->
                </div>

                <div style="padding: 10px;">

                    <div>
                        <span id="into_game_button">PLAY</span>
                    </div>

                </div>

            </div>
        </div>
    </div>
</div>


<div id="user_account" class="closed">
    <div id="all_stickers">
        <h3 style="padding: 10px;">Ваши стикеры</h3>
        <div class="html"></div>
    </div>
    <div id="all_skins">
        <h3 style="padding: 10px;">Ваши скины</h3>
        <div class="html"></div>
        <div class="html local"></div>
    </div>
</div>

<div id="buttons_block">
    <div id="settings_gear">
        <img src="/src/images/gear.png">
    </div>
    <div id="controller_settings">
        <img src="/src/images/gamepad.png">
    </div>
    <div id="music_button">
        <img src="/src/images/music_button.png">
    </div>
</div>

<div id="select_music" class="closed">
    <h3 style="text-align: center;">Вставьте ссылку на mp3 файл</h3>
    <input type="text" class="gold_input" placeholder="Ссылка" id="audio_href">
    <audio src="" controls style="display: none;" id="game_music"></audio>
</div>

<div id="controller_view" class="closed">
    <div>
        <div class="flex_row">
            <span class="controller_button">SPACE</span>
            <span class="controller_description">Разделиться</span>
        </div>
        <div class="flex_row">
            <span class="controller_button">W</span>
            <span class="controller_description">Стрелять</span>
        </div>
        <div class="flex_row">
            <span class="controller_button">C</span>
            <span class="controller_description">Настройки</span>
        </div>
        <div class="flex_row">
            <span class="controller_button">ESC</span>
            <span class="controller_description">Меню</span>
        </div>
        <div class="flex_row">
            <span class="controller_button">G</span>
            <span class="controller_description">Личный кабинет</span>
        </div>
    </div>
</div>

<div id="game_settings" class="closed">
    <h2 style="text-align: center;">Настройки</h2>
    <div>
        <span class="label_settings">Фон</span>
        <input type="color" class="select_color_input" data-name="background" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isBackground">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Цвет шаров</span>
        <input type="color" class="select_color_input" data-name="cellColor" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isCellColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Цвет еды</span>
        <input type="color" class="select_color_input" data-name="foodColor" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isFoodColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Цвет выброшенной массы</span>
        <input type="color" class="select_color_input" data-name="bulletColor" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isBulletColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Цвет вирусов</span>
        <input type="color" class="select_color_input" data-name="virusColor" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isVirusColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Свечение</span>
        <input type="color" class="select_color_input" data-name="shadowColor" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isShadowColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Сетка</span>
        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isGrid">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Оптимизация</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isOptimization">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Отображать массу игроков</span>
        <!--                <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isCellMass">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Отображать  везде массу (возможны лаги)</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isAllMass">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Не показывать ники</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isHideNick">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Обводить границы</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isDrawCellBorder">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Не загружать картинки</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="hideImage">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Уменьшить качество картинок</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isLowImage">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Не показывать еду</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isHideFood">
            <div>
                <div></div>
            </div>
        </div>
    </div>

    <div>
        <span class="label_settings">Увеличить текст</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isBigText">
            <div>
                <div></div>
            </div>
        </div>
    </div>


</div>


<!--<script defer src="src/js/pixi.js"></script>-->
<script defer src="../src/js/index.js"></script>
<script defer src="../src/js/game.js"></script>
