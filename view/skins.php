<link rel="stylesheet" href="/src/css/skins.css">


<div id="main_block" class="flex_row" style="align-items: flex-start; white-space: nowrap;">

    <div>
        <div id="create_skin" class="button button_green">Создать скин</div>
        <div id="all_skins">

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