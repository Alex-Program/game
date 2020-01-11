<link rel="stylesheet" href="/src/css/admin_skins.css">

<div id="main_block">
    <div id="search_filter">
        <div class="flex_row">
            <span class="main_text">Нестрогий поиск</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter no" data-name="is_no_restrict">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="flex_row">
            <span class="main_text">Ник</span>
            <input type="text" class="gold_input" data-name="nick">
        </div>
        <div class="flex_row">
            <span class="main_text">ИД (через запятую)</span>
            <input type="text" class="gold_input" placeholder="1,2,3" value="" data-name="user_id">
        </div>
        <div class="flex_row">
            <span class="main_text">Админ</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_admin">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="flex_row">
            <span class="main_text">Модератор</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_moder">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="flex_row">
            <span class="main_text">Хелпер</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_helper">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="flex_row">
            <span class="main_text">Золотой ник</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_gold">
                <div>
                    <div></div>
                </div>
            </div>
        </div>

        <div class="flex_row">
            <span class="main_text">Фиолетовый ник</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_violet">
                <div>
                    <div></div>
                </div>
            </div>
        </div>

        <div class="flex_row">
            <span class="main_text">Прозрачный скин</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_transparent_skin">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="flex_row">
            <span class="main_text">Поворачивающийся скин</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_turning_skin">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="flex_row">
            <span class="main_text">Невидимый ник</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_invisible_nick">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="flex_row">
            <span class="main_text">Меняющийся цвет</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_random_color">
                <div>
                    <div></div>
                </div>
            </div>
        </div>
        <div class="flex_row">
            <span class="main_text">Цветной ник</span>
            <div class="tumbler">
                <input type="checkbox" class="search_filter" data-name="is_random_nick_color">
                <div>
                    <div></div>
                </div>
            </div>
        </div>

        <div class="flex_row" style="justify-content: flex-start;">
            <button id="show_nicks" class="button button_primary">Показать</button>
            <button class="button button_red" style="margin-left: 10px;" id="reset_filter">Отмена</button>
            <button class="button button_green" style="margin-left: 10px; white-space: nowrap;" id="show_all_nicks">
                Показать все
            </button>
        </div>
    </div>

    <div id="all_skins" style="margin-left: 20px;">

    </div>
</div>

<input type="file" style="display: none;" id="image_input">

<div id="nick_info" class="closed">
    <h3 style="text-align: center;"></h3>
    <div class="flex_row">
        <span class="main_text">Ник</span>
        <input class="gold_input" value="" data-name="nick">
    </div>
    <div class="flex_row">
        <span class="main_text">Пароль</span>
        <input class="gold_input" value="" data-name="password">
    </div>

    <div class="flex_row">
        <span class="main_text">ИД владельца</span>
        <input type="text" class="gold_input" value="" data-name="user_id">
    </div>
    <div class="flex_row">
        <span class="main_text">Админ</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_admin">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div class="flex_row">
        <span class="main_text">Модератор</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_moder">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div class="flex_row">
        <span class="main_text">Хелпер</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_helper">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div class="flex_row">
        <span class="main_text">Золотой ник</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_gold">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div class="flex_row">
        <span class="main_text">Фиолетовый ник</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_violet">
            <div>
                <div></div>
            </div>
        </div>
    </div>

    <div class="flex_row">
        <span class="main_text">Прозрачный скин</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_transparent_skin">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div class="flex_row">
        <span class="main_text">Поворачивающийся скин</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_turning_skin">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div class="flex_row">
        <span class="main_text">Невидимый ник</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_invisible_nick">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div class="flex_row">
        <span class="main_text">Меняющийся цвет</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_random_color">
            <div>
                <div></div>
            </div>
        </div>
    </div>
    <div class="flex_row">
        <span class="main_text">Цветной ник</span>
        <div class="flex_grow_all"></div>

        <div class="tumbler">
            <input type="checkbox" class="search_filter" data-name="is_random_nick_color">
            <div>
                <div></div>
            </div>
        </div>
    </div>

    <div class="flex_row" style="justify-content: center;">
        <img id="nick_image">
    </div>

    <div class="flex_row">
        <button class="button button_primary" id="save_button">Сохранить</button>
        <button class="button button_red" id="cancel_save_button" style="margin-left: 10px;">Отмена</button>
    </div>

</div>


<script defer src="/src/js/admin_skins.js"></script>