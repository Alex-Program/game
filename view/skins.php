<link rel="stylesheet" href="/src/css/skins.css">


<div id="main_container">
    <div style="white-space: nowrap;">
        <h3 id="create_new_nick" class="button_primary">Ваши ники <span>+</span></h3>
        <div id="user_nicks"></div>
    </div>
    <div style="padding: 10px; position: relative;">
        <canvas width="512" height="512" id="main_canvas"></canvas>
        <div>
            <input type="file" style="display: none;" id="select_skin_image">
            <button class="button button_primary" id="select_file_button">Выбрать файл</button>
        </div>
    </div>
    <div style="padding: 5px; white-space: nowrap;">
        <div>
            <div class="label_params">Цвет фона:</div>
            <input type="color" style="display: none;" class="color_select" value="#000000" data-type="background">
            <button type="button" class="button button_green color_select_button">#000000</button>
        </div>
        <div style="margin-top: 5px;">
            <div class="label_params">Цвет шара:</div>
            <input type="color" style="display: none;" class="color_select" value="#FF0000" data-type="cell">
            <button type="button" class="button button_green color_select_button">#FF0000</button>
        </div>
        <div style="border-bottom: solid 1px grey; padding-bottom: 5px; margin-top: 5px;">
            <div class="label_params">Прозрачный скин</div>
            <div class="tumbler">
                <input type="checkbox" id="is_transparent">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="nick_info" class="closed">
    <form onsubmit="return false;">
        <input type="hidden" data-name="id" value="0" id="nick_id">
        <img id="close_nick_info" src="/src/images/burger.png">
        <h3 style="border-bottom: solid 1px black; text-align: right;">Создать ник</h3>
        <div style="margin-top: 20px;">
            <div class="label_params">Ник</div>
            <input type="text" placeholder="Ник" data-name="nick">
        </div>
        <div style="margin-top: 20px;">
            <div class="label_params">Пароль</div>
            <input type="text" placeholder="Ник" data-name="password">
        </div>
        <div style="display: flex; flex-direction: row; margin-top: 20px;">
            <div class="label_params">Скин</div>
            <div class="tumbler" style="margin-left: 10px;">
                <input type="checkbox" data-name="skin" id="is_skin">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div style="flex-direction: row; margin-top: 20px;" class="closed" id="change_skin">
            <div class="label_params">Изменить скин</div>
            <div class="tumbler" style="margin-left: 10px;">
                <input type="checkbox" data-name="change_skin">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div style="margin-top: 20px;">
            <button class="button button_green" id="create_nick_button">Создать</button>
        </div>
        <div style="margin-top: 20px;">
            <button class="button button_green" id="change_nick_button">Изменить</button>
        </div>
    </form>
</div>

<script defer src="/src/js/skins.js"></script>