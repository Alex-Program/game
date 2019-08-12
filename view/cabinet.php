<link rel="stylesheet" href="/src/css/cabinet.css">

<div id="main_container">

    <div id="main_header">
        <div style="border-radius: 75px; overflow: hidden; cursor: pointer;" id="load_image">
            <form style="display: none;"><input type="file" id="image_select"></form>
            <img src="/src/images/user_img.png" style="width: 150px; height: 150px;" alt="" class="user_img">
            <canvas width="150" height="150" style="display: none;" id="image_preview"></canvas>
            <div id="load_image_label">Загрузить</div>
        </div>
        <div>
            <div class="user_name"></div>
            <div id="change_user_name"><input type="text" id="user_name_input" value="" required></div>
        </div>
    </div>
    <button class="button_primary" id="save_image_button" style="display: none;">Сохранить</button>
</div>

<script defer src="/src/js/cabinet.js"></script>