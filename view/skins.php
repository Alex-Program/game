<link rel="stylesheet" href="/src/css/skins.css">


<div id="main_block" class="flex_row" style="align-items: flex-start; white-space: nowrap;">
    <div id="nicks_menu">
        <div class="skin_tag selected" data-name="nicks">Ники</div>
        <div class="skin_tag" data-name="clans">Кланы</div>
    </div>
    <div style="margin-left: 10px;">
        <div id="create_skin" class="button button_green">Создать скин</div>
        <div id="all_skins" class="all_skins" data-name="nicks">

        </div>
        <div id="all_clans" class="all_skins" style="display: none;" data-name="clans">

        </div>
    </div>
    <div class="flex_row" style="margin-left: 10px; align-items: flex-start;">
        <div id="nick_info">

            <div class="flex_row">
                <span class="label_info">Ник</span>
                <input class="gold_input" value="" data-name="nick" data-value="">
            </div>
            <div class="flex_row">
                <span class="label_info">Пароль</span>
                <input class="gold_input" value="" data-name="password" data-value="">
            </div>
            <div class="flex_row">
                <span class="label_info">Прозрачный скин</span>
                <div class="tumbler">
                    <input type="checkbox" class="toggle_settings" data-name="is_transparent_skin">
                    <div>
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="flex_row">
                <span class="label_info">Поворачивающийся скин</span>
                <div class="tumbler">
                    <input type="checkbox" class="toggle_settings" data-name="is_turning_skin">
                    <div>
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="flex_row">
                <span class="label_info">Невидимый ник</span>
                <div class="tumbler">
                    <input type="checkbox" class="toggle_settings" data-name="is_invisible_nick">
                    <div>
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="flex_row">
                <span class="label_info">Рандомно меняющийся цвет</span>
                <div class="tumbler">
                    <input type="checkbox" class="toggle_settings" data-name="is_random_color">
                    <div>
                        <div></div>
                    </div>
                </div>
            </div>
            <div class="flex_row">
                <span class="label_info">Цветной ник</span>
                <div class="tumbler">
                    <input type="checkbox" class="toggle_settings" data-name="is_random_nick_color">
                    <div>
                        <div></div>
                    </div>
                </div>
            </div>

            <div class="flex_row" style="justify-content: flex-start; padding-top: 10px; border-top: solid 3px gold;">
                <span id="sum"><span>0</span><span> snl</span></span>
                <button class="button button_primary" id="create_skin_button">Создать</button>
                <button class="button button_primary" id="change_skin_button" style="display: none;">Изменить</button>
            </div>
        </div>

        <div style="margin-left: 10px;">
            <canvas width="256" height="256" id="skin_canvas">

            </canvas>
            <input type="file" style="display: none;" id="image_input">
            <div class="flex_row" style="margin-top: 10px; justify-content: flex-start;">
                <span id="add_image_button">+</span>
                <span id="remove_image_button">-</span>
            </div>
        </div>
    </div>

</div>

<script defer src="/src/js/skins.js"></script>