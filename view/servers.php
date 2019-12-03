<link rel="stylesheet" href="/src/css/servers.css">

<div id="main_block">
    <div class="flex_row">
        <input class="gold_input" value="" placeholder="Сообщение" id="global_message">
        <button id="send_global_message" class="button button_primary">Отправить</button>
    </div>
    <div id="servers_list">

    </div>

    <div class="divider"></div>

    <div class="server flex_row">
        <input type="text" class="gold_input no_style" placeholder="Наименование" value="" data-name="name" style="flex-grow: 1;">
        <input type="text" class="gold_input no_style ip" placeholder="IP" value="" data-name="ip">
        <button class="button_green button" id="add_server">Добавить</button>
        <button class="button_primary button" id="cancel_add">Отмена</button>
    </div>

</div>


<div id="server_info" class="closed">
    <h3 style="text-align: center;">Настройки сервера</h3>
    <div class="flex_row">
        <span>Ширина</span>
        <input class="gold_input" data-name="width" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Высота</span>
        <input class="gold_input" data-name="height" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Начальная масса</span>
        <input class="gold_input" data-name="startMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Количество еды</span>
        <input class="gold_input" data-name="food" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Минимальная масса еды</span>
        <input class="gold_input" data-name="foodMinMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Максимальная масса еды</span>
        <input class="gold_input" data-name="foodMaxMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Количество вирусов</span>
        <input class="gold_input" data-name="virus" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Начальная масса вирусов</span>
        <input class="gold_input" data-name="virusStartMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Максимальная масса вирусов</span>
        <input class="gold_input" data-name="virusMaxMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Выброшенная масса</span>
        <input class="gold_input" data-name="bulletMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Коэффициент съеденной массы</span>
        <input class="gold_input" data-name="bulletEatenCoefficient" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Дистанция Выброшенной массы</span>
        <input class="gold_input" data-name="bulletDistance" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Время соединения</span>
        <input class="gold_input" data-name="connectTime" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Коэффициент времени соединения</span>
        <input class="gold_input" data-name="connectTimeMassCoefficient" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Максимальное количество частей</span>
        <input class="gold_input" data-name="maxCells" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Максимальная масса части</span>
        <input class="gold_input" data-name="maxCellMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Количество ботов</span>
        <input class="gold_input" data-name="botsCount" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Интервал обновления ботов</span>
        <input class="gold_input" data-name="botsUpdateDirectionInterval" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Количество кормушек</span>
        <input class="gold_input" data-name="feedingVirusCount" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Начальная масса кормушек</span>
        <input class="gold_input" data-name="feedingVirusStartMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Максимальная масса кормушек</span>
        <input class="gold_input" data-name="feedingVirusMaxMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Интервал стрельбы кормушек</span>
        <input class="gold_input" data-name="feedingVirusInterval" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Коэффициент стрельбы кормушек</span>
        <input class="gold_input" data-name="feedingVirusIntervalCoefficient" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Коэффициент снижения массы кормушек</span>
        <input class="gold_input" data-name="feedingVirusShootCoefficient" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Количество черных дыр</span>
        <input class="gold_input" data-name="blackHoleCount" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Коэффициент скорости черных дыр</span>
        <input class="gold_input" data-name="blackHoleSpeedCoefficient" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Начальная масса черных дыр</span>
        <input class="gold_input" data-name="blackHoleStartMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Количество стреляющих черных дыр</span>
        <input class="gold_input" data-name="shootingBlackHoleCount" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Интервал стрельбы черных дыр</span>
        <input class="gold_input" data-name="blackHoleShootInterval" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Масса стрельбы черных дыр</span>
        <input class="gold_input" data-name="blackHoleBulletMass" value="0" placeholder="0">
    </div>
    <div class="flex_row">
        <span>Дистанция стрельбы черных дыр</span>
        <input class="gold_input" data-name="blackHoleBulletDistance" value="0" placeholder="0">
    </div>


    <div class="flex_row" style="justify-content: flex-start;">
        <button class="button button_green" id="save_server_info">Сохранить</button>
        <button class="button button_red" id="cancel_server_info" style="margin-left: 10px;">Отмена</button>
    </div>
</div>

<script defer src="/src/js/servers.js"></script>