(function () {
    // setTimeout(() => new Notify("sfwef", "fwefwe"), 2000);
    // setTimeout(() => new Notify("sfwef", "fwefwe"), 4000);

    $("body").on("click", ".show_password", function () {
        let type = $(".password:eq(0)").attr("type");
        let text = "Показать пароль";
        if (type === "password") {
            type = "text";
            text = "Скрыть пароль"
        } else type = "password";

        $(".show_password").html(text);
        $(".password").attr("type", type);

    })


        .on("click", "#sign_in_button", function () {
            let userId = $("#user_id_sign_in").val();
            let password = $("#password_sign_in").val();

            if (!userId || !password) return true;

            let preloader = $("#preloader");
            preloader.removeClass("active").addClass("show active");

            sendRequest("/api/registration", {"action": "auth", "user_id": userId, "password": password})
                .then(data => {
                    if (data.result === "true") {
                        /**
                         * @property token String
                         * @property user_id String
                         */
                        setCookie("User-Id", data.data.user_id, {"max-age": 30 * 24 * 60 * 60});
                        setCookie("Token", data.data.token, {"max-age": 30 * 24 * 60 * 60});
                        window.location.reload();
                        return true;
                    }

                }, () => alert("d"))
                .finally(() => preloader.removeClass("show"));
        });

})();