<script src="/src/js/jquery-3.3.1.js"></script>
<script src="/src/js/functions.js"></script>
<script src="/src/js/Notify.js"></script>
<script src="/src/js/Ws.js"></script>
<link rel="stylesheet" href="/src/css/header.css">
<link rel="stylesheet" href="/src/css/sign.css">

<div id="main_sign">

    <div id="header_sign">
        <div class="sign_button selected" data-id="sign_in_container">Вход</div>
        <div class="sign_button">Регистрация</div>
    </div>
    <div id="preloader">
        <div></div>
    </div>
    <div id="sign_in_container" class="sign_container">

        <form>
            <div class="form_div">
                <span class="label">ИД</span>
                <input type="number" id="user_id_sign_in" placeholder="ИД" required>
            </div>
            <div class="form_div">
                <span class="label">Пароль</span>
                <input type="password" id="password_sign_in" class="password" placeholder="Пароль" required>
                <div class="show_password">Показать пароль</div>
            </div>
            <div class="form_div" style="display: block;">
                <button type="button" class="button_primary" id="sign_in_button">Войти</button>
            </div>
        </form>

    </div>

</div>

<script defer src="/src/js/sign.js"></script>