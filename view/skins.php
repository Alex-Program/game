<link rel="stylesheet" href="/src/css/skins.css">


<div id="main_container">
    <div style="white-space: nowrap;">
        <h3>Ваши ники</h3>
    </div>
    <div style="padding: 10px;">
        <canvas width="512" height="512" id="main_canvas"></canvas>
        <div>
            <input type="file" style="display: none;" id="select_skin_image">
            <button class="button button_primary" id="select_file_button">Выбрать файл</button>
        </div>
    </div>
    <div style="padding: 5px; white-space: nowrap;">
        <div>
            <input type="color" style="display: none;" id="color_select" value="#000000">
            <div style="margin-bottom: 10px; font: normal 13pt/15pt sans-serif;">Цвет фона:</div>
            <button type="button" id="color_select_button" class="button button_green">#000000</button>
        </div>
    </div>
</div>

<script defer src="/src/js/skins.js"></script>