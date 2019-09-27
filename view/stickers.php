<link rel="stylesheet" href="/src/css/stickers.css">

<!--<div id="main_block">-->
<!--    <div style="white-space: nowrap;">-->
<!--        <h5 id="create_new_stickers" class="button_primary">Ваши стикеры <span> + </span></h5>-->
<!--        <div id="user_stickers">-->
<!---->
<!--        </div>-->
<!--    </div>-->
<!--    <div id="main_canvas">-->
<!--        <div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--        </div>-->
<!--        <div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--        </div>-->
<!--        <div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--            <div>-->
<!--                <input type="file" style="display: none;" class="sticker_image">-->
<!--                <canvas width="150" height="150"></canvas>-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!---->
<!--</div>-->

<div id="main_block">
    <div style="white-space: nowrap; padding: 15px;">
        <h5 style="margin-bottom: 25px;">Категории</h5>
        <div id="all_sticker_groups">
            <div class="sticker_group" data-id="0" style="font-weight: bold;">Новые</div>
        </div>
    </div>
    <div id="stickers_in_group">
        <button class="button button_green" id="add_sticker">Добавить в категорию</button>
        <div id="all_stickers">

        </div>
    </div>
    <div id="main_canvas" style="display: none;">
        <div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
        </div>
        <div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
        </div>
        <div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
            <div>
                <input type="file" style="display: none;" class="sticker_image">
                <canvas width="150" height="150"></canvas>
            </div>
        </div>
        <div id="add_stickers_div">
            <input type="text" placeholder="Наименование" id="sticker_name" required>
            <button class="button_primary button" id="add_sticker_button" style="margin-left: 10px;">Добавить</button>
        </div>
    </div>
</div>

<script defer src="/src/js/stickers.js"></script>