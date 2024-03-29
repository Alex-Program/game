<html>
<head>
    <script src="/src/js/jquery-3.3.1.js"></script>
    <script src="/src/js/functions.js"></script>
    <script src="/src/js/Notify.js"></script>
    <script src="/src/js/Ws.js"></script>
    <link href="https://fonts.googleapis.com/css?family=Special+Elite&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Caveat&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../src/css/whole.css">
    <link rel="stylesheet" href="../src/css/index.css">
    <link rel="shortcut icon" href="/src/images/logo.png" type="image/png">
    <title>SandL</title>
</head>
<body>

<canvas id="canvas">

</canvas>

<div id="open_info" class="closed">
    <img src="/src/images/information.png">
</div>

<div id="coords">
    <div id="close_info">x</div>
    <div class="flex_row">
        <span class="label">Cells</span>
        <span class="value"></span>
    </div>
    <div class="flex_row">
        <span class="label">Mass</span>
        <span class="value"></span>
    </div>
    <div class="flex_row">
        <span class="label">Coords</span>
        <span class="value"></span>
    </div>
    <div class="flex_row fps">
        <span class="label">FPS</span>
        <span class="value"></span>
    </div>
    <div class="flex_row ping">
        <span class="label">Ping</span>
        <span class="value"></span>
    </div>
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


<div id="admin_panel" class="closed">
    <div class="flex_row">
        <div data-id="players_for_admin" class="admin_tag selected">Игроки</div>
        <div data-id="report" class="admin_tag">Жалобы</div>
    </div>

    <div style="padding: 20px; background: rgba(0,0,0,0.8);" id="admin_data">
        <div id="players_for_admin">
            <div class="flex_row" class="header">
                <span class="id main_text">Id</span><span class="nick main_text">Ник</span><span class="mass main_text" data-action="change_mass">Масса</span>
            </div>
            <div class="data">

            </div>
        </div>
        <div id="report" style="display: none;">

        </div>
    </div>
</div>


<div id="admin_panel_action" class="closed">
    <div class="flex_row" data-name="mass">
        <input type="text" class="gold_input" style="width: 100px;">
        <button id="admin_change_mass" class="button button_primary" style="margin-left: 5px;">Изменить</button>
    </div>
    <div class="flex_row" data-name="nick">
        <input type="text" class="gold_input" style="width: 100px;">
        <button id="admin_change_nick" class="button button_primary" style="margin-left: 5px;">Изменить</button>
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
    <div>Забанить ЛК</div>
</div>

<div class="user_actions user closed">
    <div></div>
    <div>Не показывать сообщения</div>
    <div>Выделять сообщения</div>
    <div>Написать ЛС</div>
    <div>Обратиться</div>
    <div>Скопировать ник</div>
    <div>Пожаловаться</div>
</div>

<div id="online_players" class="closed">
    <h2 style="padding: 10px; display: flex; flex-direction: row;">Игроки онлайн <span class="total_players"></span>
    </h2>
    <div>

    </div>
</div>

<div id="main_menu">
    <span id="sandl">SandL.pw</span>
    <div style="display: flex; justify-content: center; margin-top: 5px; position: relative; z-index: 1;">
        <div id="login">
            <div>
                <div>
                    <input type="text" class="red_input" id="login_sign_in" placeholder="ИД">
                </div>
                <div>
                    <input type="text" class="red_input" id="password_sign_in" placeholder="Пароль">
                </div>
            </div>
            <div style="display: flex; justify-content: center; flex-direction: row;">
                <button class="button button_primary" id="sign_in_button">Войти</button>
                <button class="button button_green" id="to_sign_up" style="margin-left: 10px;">Регистрация</button>
            </div>
        </div>
        <div id="account_div" style="display: none; position: relative;">
            <div class="flex_row" style="z-index: 2;">
                <img src="">
                <div class="user_name"></div>
                <div class="main_text"><span><span class="user_level"></span> LVL</span></div>
                <div id="add_balance_div">
                    <div class="user_balance"></div>
                    <div id="add_balance">+</div>
                </div>
            </div>
            <div id="exit_button" class="closed">ВЫЙТИ</div>
        </div>
        <div id="registration_div" style="display: none;">
            <input type="text" class="red_input" placeholder="Имя" id="name_sign_up" required>
            <input type="text" class="red_input" placeholder="Пароль" style="margin-top: 5px;" id="password_sign_up"
                   required>
            <input type="text" class="red_input" placeholder="Повторите пароль" style="margin-top: 5px;"
                   id="repeat_password" required>
            <div class="flex_row" style="margin-top: 5px;">
                <button class="button button_primary" id="to_sign_in">Вход</button>
                <button class="button button_green" style="margin-left: 10px;" id="sign_up_button">Зарегистрироваться
                </button>
            </div>
        </div>
    </div>
    <div style="position: relative; display: flex; flex-direction: row; margin-left:10px; margin-right: 10px; z-index: 1; pointer-events: none;">
        <div class="triangle">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 2000 2000">
                <defs>
                    <style>
                        .cls-1 {
                            fill-rule: evenodd;
                        }
                    </style>
                </defs>
                <path stroke-width="40" stroke="red" fill="red"
                      class="cls-1" d="M997.258,631.983L746.418,184.851l512.652,6.332Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1078.98L746.418,631.851l512.652,6.332Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1525.98l-250.84-447.13,512.652,6.33Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1972.98l-250.84-447.13,512.652,6.33Z"/>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 2000 2000" class="rotate"
                 style="margin-top: 23%; margin-left: -23%;">
                <defs>
                    <style>
                        .cls-1 {
                            fill-rule: evenodd;
                        }
                    </style>
                </defs>

                <path stroke-width="40" stroke="red" fill="red"
                      class="cls-1" d="M997.258,631.983L746.418,184.851l512.652,6.332Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1078.98L746.418,631.851l512.652,6.332Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1525.98l-250.84-447.13,512.652,6.33Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1972.98l-250.84-447.13,512.652,6.33Z"/>

            </svg>

        </div>

        <div class="triangle" style="justify-content: flex-end;">
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 2000 2000" class="rotate"
                 style="margin-top: 23%;">
                <defs>
                    <style>
                        .cls-1 {
                            fill-rule: evenodd;
                        }
                    </style>
                </defs>

                <path stroke-width="40" stroke="red" fill="red"
                      class="cls-1" d="M997.258,631.983L746.418,184.851l512.652,6.332Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1078.98L746.418,631.851l512.652,6.332Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1525.98l-250.84-447.13,512.652,6.33Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1972.98l-250.84-447.13,512.652,6.33Z"/>

            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 2000 2000"
                 style="margin-left: -23%;">
                <defs>
                    <style>
                        .cls-1 {
                            fill-rule: evenodd;
                        }
                    </style>
                </defs>
                <path stroke-width="40" stroke="red" fill="red"
                      class="cls-1" d="M997.258,631.983L746.418,184.851l512.652,6.332Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1078.98L746.418,631.851l512.652,6.332Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1525.98l-250.84-447.13,512.652,6.33Z"/>
                <path stroke-width="40" stroke="red" fill="white"
                      class="cls-1" d="M997.258,1972.98l-250.84-447.13,512.652,6.33Z"/>
            </svg>
        </div>

    </div>

    <div id="play_button">PLAY</div>


    <div id="servers_list">
        <div id="servers_header">
            <div style="position: relative; width: 100%; height: 100%;">
                <div id="collapse_servers">▼</div>
            </div>
        </div>
        <div style="display: flex; flex-direction: row; border: dashed 3px gold; padding: 5px; background: lightseagreen; border-radius: 5px;">
            <div class="flex_row">
                <span class="label_input">Клан:</span>
                <input type="text" class="gold_input" placeholder="Клан" id="clan_for_game">
            </div>
            <div style="position: relative; margin-left: 10px;" class="flex_row">
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
            <span id="color_preview" class="color_preview"
                  style="color: black; background: #FFD700; border-color: #cda500">#FFD700</span>
        </div>
        <div style="display: flex; justify-content: center;">
            <img id="skin_preview" class="closed">
        </div>
        <div>
            <h2 class="h2">Выберите сервер</h2>
            <div style="display: flex; flex-direction: row;">
                <div style="padding: 10px;" id="all_servers">

                </div>

                <div style="padding: 10px;">

                    <div class="flex_row">
                        <span id="into_game_button">PLAY</span>
                        <span id="spectate_button">SPECTATE</span>
                    </div>

                </div>

            </div>
        </div>
    </div>


    <div id="main_buttons" class="closed">
        <div data-page="cabinet">
            <span><img src="/src/images/account.png">Личный кабинет</span>
        </div>
        <div>
            <span><img src="/src/images/trophy_cup.png">Топ игроков</span>
        </div>
        <div>
            <span><img src="/src/images/help.png"></img>Помощь</span>
        </div>
    </div>

    <div id="vk" class="flex_row">
        <img src="/src/images/vk.png">
        <span>Подпишись и узнай обо всем первым!</span>
    </div>
</div>


<div id="show_account">
    <img src="/src/images/account.png">
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
    <div id="screenshot">
        <img src="/src/images/screenshot.png">
    </div>
    <div id="to_admin_panel" class="for_moder" style="display: none;">
        <img src="/src/images/admin.png">
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
        <span class="label_settings">Картинка на фон</span>
        <input type="text" class="gold_input settings_input" data-name="backgroundImage" id="background_image"
               placeholder="http://..." style="width: 130px; font-size: 12pt;">
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isBackgroundImage">
            <div>
                <div></div>
            </div>
        </div>
    </div>
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
        <span class="label_settings">Цвет ников игроков</span>
        <input type="color" class="select_color_input" data-name="cellNickColor" value="#FFFFFF">
        <span class="select_color_span" style="background: #FFFFFF; color: black;">#FFFFFF</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isCellNickColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Выделять кланы</span>
        <input type="color" class="select_color_input" data-name="clanCellColor" value="#FFD700">
        <span class="select_color_span" style="background: #FFD700; color: black;">#FFD700</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isClanCellColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Цвет массы игроков</span>
        <input type="color" class="select_color_input" data-name="cellMassColor" value="#FFFFFF">
        <span class="select_color_span" style="background: #FFFFFF; color: black;">#FFFFFF</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isCellMassColor">
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
        <span class="label_settings">Цвет уменьшающей массы</span>
        <input type="color" class="select_color_input" data-name="decreaseBulletColor" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isDecreaseBulletColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Цвет массы вирусов</span>
        <input type="color" class="select_color_input" data-name="virusMassColor" value="#FFFFFF">
        <span class="select_color_span" style="background: #FFFFFF; color: black;">#FFFFFF</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isVirusMassColor">
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
        <span class="label_settings">Свечение текста</span>
        <input type="color" class="select_color_input" data-name="textShadowColor" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isTextShadowColor">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Показывать сообщения над игроком</span>
        <input type="color" class="select_color_input" data-name="textShowMessage" value="#000000">
        <span class="select_color_span" style="background: #000000; color: white;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isShowMessage">
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
    <!--    <div>-->
    <!--        <span class="label_settings">Grayscale-фильтр (сильные лаги)</span>-->
    <!--                <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
    <!--        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>-->
    <!--        <div class="tumbler">-->
    <!--            <input type="checkbox" class="toggle_settings" data-name="isGrayscale">-->
    <!--            <div>-->
    <!--                <div></div>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--    </div>-->
    <!--    <div>-->
    <!--        <span class="label_settings">Sepia-фильтр (сильные лаги)</span>-->
    <!--                <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
    <!--        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>-->
    <!--        <div class="tumbler">-->
    <!--            <input type="checkbox" class="toggle_settings" data-name="isSepia">-->
    <!--            <div>-->
    <!--                <div></div>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--    </div>-->
    <div>
        <span class="label_settings">Яркие цвета (сильные лаги)</span>
        <!--                <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isBrigthness">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <!--    <div>-->
    <!--        <span class="label_settings">Инверсия цветов (сильные лаги)</span>-->
    <!--                <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
    <!--        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>-->
    <!--        <div class="tumbler">-->
    <!--            <input type="checkbox" class="toggle_settings" data-name="isInvertColor">-->
    <!--            <div>-->
    <!--                <div></div>-->
    <!--            </div>-->
    <!--        </div>-->
    <!--    </div>-->
    <div>
        <span class="label_settings">Отключить автоматическую очистку поля</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isDisableAutoClear">
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
        <span class="label_settings">Отображать массу вирусов</span>
        <!--                <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isVirusMass">
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
        <span class="label_settings">Показывать невидимые ники</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isShowInvisibleNick">
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
        <span class="label_settings">Обводить границы прозрачных игроков</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isDrawBorderInvisible">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Отключить прозрачные скины</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isDisableTransparentSkin">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Отключить поворачивающиеся скины</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isDisableTurningSkin">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Без скинов</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="hideSkins">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Без стикеров</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="hideStickers">
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
        <span class="label_settings">Не кешировать картинки</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isDisableImageCache">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Отключить анимированные цвета</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isDisableColorAnim">
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
    <div>
        <span class="label_settings">Уменьшить текст</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isSmallText">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div>
        <span class="label_settings">Полупрозрачный текст</span>
        <!--        <input type="color" class="select_color_input" data-name="gridColor" value="#000000">-->
        <span class="select_color_span" style="background: #000000; color: white; visibility: hidden;">#000000</span>
        <div class="tumbler">
            <input type="checkbox" class="toggle_settings" data-name="isAlphaText">
            <div>
                <div></div>
            </div>
        </div>
    </div>


</div>


<div id="user_nicks" class="closed">
    <div class="flex_row" style="border-radius: 5px; overflow: hidden;">
        <div id="change_color" class="color_preview" style="background: #FFD700; border-color: #cda500"></div>
        <div class="flex_row" style="border-radius: 5px; overflow: hidden; white-space: nowrap;">
            <span class="account_tag selected" data-target="user_skins">Ники</span>
            <span class="account_tag" data-target="local_skins">Локальные ники</span>
            <span class="account_tag" data-target="user_stickers">Стикеры</span>
        </div>
    </div>

    <div class="user_skins toggle">

    </div>
    <div class="local_skins toggle" style="display: none;">

    </div>
    <div class="user_stickers toggle" style="display: none;">

    </div>
</div>

<!--<script defer src="src/js/pixi.js"></script>-->
<script defer src="../src/js/index.js"></script>
<script defer src="../src/js/game.js"></script>

</body>
</html>