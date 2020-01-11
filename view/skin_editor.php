<link rel="stylesheet" href="/src/css/skin_editor.css">


<div id="main_block">
    <div class="flex_row">
        <canvas id="canvas" height="500" width="500"></canvas>
    </div>
    <input type="file" style="display: none;" id="image_input">
    <div class="flex_row">
        <button class="button button_primary" id="select_image">Выбрать изображение</button>
        <button class="button button_green" id="save_image">Сохранить</button>
    </div>
</div>
<div id="instruments">
    <div class="flex_row">
        <img class="instrument" src="/src/images/pencil.png" data-name="brush">
    </div>
    <div class="flex_row">
        <input type="color" style="display: none;" class="select_color" data-name="main">
        <div class="instrument color" style="background: #000000; border: solid 3px gold;"></div>
    </div>
</div>

<script defer src="/src/js/skin_editor.js"></script>