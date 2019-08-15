<link rel="stylesheet" href="/src/css/cabinet.css">

<div id="right_menu" class="closed">
    <div>
        <h3 style="text-align: center;">Перевести деньги</h3>
        <div class="input_div">
            <div style="width: 50px;">ИД</div>
            <input type="text" id="user_id_input" class="no_style" value="1" pattern="[0-9]{1,}">
        </div>
        <div class="input_div" style="margin-top: 10px;">
            <div>Сумма</div>
            <input type="text" id="transfer_sum_input" class="no_style" value="0" pattern="[0-9]{1,}">
        </div>
        <div style="font: bold 10pt/12pt sans-serif; text-align: center; margin-top: 5px;">
            <span>Комиссия 10%: <span id="commission"></span></span>
        </div>
        <div class="input_div" style="margin-top: 10px;">
            <div style="width: 50px;">Итого</div>
            <input type="text" id="total_sum" class="no_style" value="0" readonly>
        </div>
    </div>
</div>

<div id="main_container">

    <div id="main_header">
        <div style="border-radius: 75px; overflow: hidden; cursor: pointer;" id="load_image">
            <form style="display: none;"><input type="file" id="image_select"></form>
            <img src="/src/images/user_img.png" style="width: 150px; height: 150px;" alt="" class="user_img">
            <canvas width="150" height="150" style="display: none;" id="image_preview"></canvas>
            <div id="load_image_label">Загрузить</div>
        </div>
        <div style="margin-left: 20px;">
            <div class="user_name"></div>
            <div id="change_user_name"><input type="text" id="user_name_input" value="" required></div>
        </div>
        <div style="margin-left: 20px;">
            <div id="balance_div">
                <div class="label">Баланс</div>
                <div class="balance"></div>
            </div>
            <div style="display: flex; flex-direction: column;">
                <button class="button button_green">Пополнить</button>
                <button class="button button_primary" id="transfer_money">Перевести</button>
            </div>
        </div>
    </div>
    <button class="button_primary" id="save_image_button" style="display: none;">Сохранить</button>
    <div>

    </div>
</div>

<script defer src="/src/js/cabinet.js"></script>