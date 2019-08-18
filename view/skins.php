<link rel="stylesheet" href="/src/css/skins.css">


<div id="main_container">
    <div style="white-space: nowrap;">
        <h3>Ваши ники</h3>
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
        <div style="margin-top: 5px;">
            <div class="label_params">Ник (макс. 15 символов)</div>
            <input type="text" id="nick_name">
        </div>
        <div style="margin-top: 5px;">
            <div class="label_params">Пароль</div>
            <input type="text" id="nick_name">
        </div>
        <div style="position: relative; margin-top: 5px;">
            <div id="create_button"><img src="/src/images/verefied.png" style="width:30px; height: 30px;" alt="Создать"></div>
            <div id="create_list" class="closed">
                <div>Создать пароль</div>
                <div>Создать скин</div>
                <div>Скин с паролем</div>
            </div>
        </div>
    </div>
</div>

<script defer src="/src/js/skins.js"></script>