<link rel="stylesheet" href="/src/css/cabinet.css">

<div id="main_container" class="flex_row">
    <div>
        <input type="file" style="display: none;" id="image_input">
        <div id="user_image">
            <canvas width="256" height="256" id="user_image_canvas"></canvas>
            <div>Загрузить<br> изображение</div>
        </div>
        <div class="flex_row" style="margin-top: 10px;">
            <button class="button button_green" id="save_user_image">Сохранить</button>
            <button class="button button_primary" id="cancel_user_image" style="margin-left: 10px;">Отмена</button>
        </div>
    </div>
    <div style="margin-left: 10px;">
        <div class="flex_row">
            <input class="gold_input" value="" placeholder="Имя" id="user_name" style="width: 200px; flex-grow: 1">
            <button class="button button_green" id="save_user_name" style="margin-left: 10px; width: 122px;">Сохранить</button>
            <button class="button button_red" id="cancel_user_name" style="margin-left: 10px; width: 118px;">Отмена</button>
        </div>
        <div style="margin-top: 10px;" class="flex_row">
            <span id="user_balance"><span></span> <span>snl</span></span>
            <button class="button button_green" style="margin-left: 10px;">Пополнить</button>
            <button class="button button_primary" style="margin-left: 10px;" id="to_transfer">Перевести</button>
        </div>
    </div>
</div>

<div id="transfer_div" class="closed">
    <h3 style="text-align: center;">Перевести</h3>
    <div class="flex_row">
        <span>ИД получателя</span>
        <input class="gold_input" placeholder="ИД" value="" id="recipient_id">
    </div>
    <div class="flex_row">
        <span>Сумма</span>
        <input class="gold_input" placeholder="Сумма" value="" id="transfer_sum">
    </div>
    <div class="flex_row">
        <span>Итого (коммиссия 10%)</span>
        <input class="gold_input" value="0" id="total_transfer_sum" readonly>
    </div>
    <div class="flex_row">
        <button class="button button_primary" id="transfer_button">Перевести</button>
        <button class="button button_red" style="margin-left: 10px;" id="cancel_transfer">Отмена</button>
    </div>
</div>

<script defer src="/src/js/cabinet.js"></script>