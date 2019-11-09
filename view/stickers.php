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
            <div class="sticker_group" data-id="-2">Предложенные стикеры</div>
            <div class="sticker_group" data-id="-1">Мои стикеры</div>
            <div class="sticker_group" data-id="0" style="font-weight: bold;">Новые</div>
        </div>
    </div>
    <div id="stickers_in_group" style="min-width: 330px;">
        <button class="button button_green" id="add_sticker" style="width: 100%;">Добавить в категорию</button>
        <div id="all_stickers">

        </div>
    </div>
    <div id="main_canvas">
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
        <div id="buy_sticker_div" style="display: none;">
            <span id="price_of_sticker"><span id="price"></span> <span>snl</span></span>
            <button id="buy_sticker_set" class="button_green button">Купить</button>
        </div>
        <div id="add_stickers_div" style="display: none;" class="flex_row">
            <input type="text" class="gold_input" placeholder="Наименование" id="sticker_name" required style="width: 200px;">
            <input type="text" class="gold_input" placeholder="Стоимость" id="sticker_price" style="margin-left: 10px; width: 145px;" required>
            <button class="button_primary button" id="add_sticker_button" style="margin-left: 10px;">Добавить</button>
        </div>

    </div>
</div>

<script defer src="/src/js/stickers.js"></script>