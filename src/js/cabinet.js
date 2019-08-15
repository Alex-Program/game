(function () {
    let canvas = document.getElementById("image_preview");
    let context = canvas.getContext("2d");

    $("body").on("click", "#main_header .user_img, #load_image_label, #image_preview", function () {
        $("#image_select").click();
    })

        .on("change", "#image_select", function () {
            let files = this.files;
            if (files.length === 0) {
                $("#image_preview").hide();
                $("#main_header .user_img").show();
                $("#save_image_button").hide();
            }

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2, false);
            context.fillStyle = "#FFFFFF";
            context.fill();
            context.closePath();

            $("#main_header .user_img").hide();
            $(canvas).show();

            let fileReader = new FileReader();
            fileReader.onload = function (event) {
                let image = new Image();
                image.onload = function () {
                    context.save();
                    context.clip();
                    context.globalCompositeOperation = "source-atop";
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    context.restore();
                };
                image.src = event.target.result;
            };

            fileReader.readAsDataURL(files[0]);
            $("#save_image_button").show();
        })

        .on("click", "#save_image_button", function () {
            let files = $("#image_select")[0].files;
            if (files.length === 0) return false;

            let form = new FormData();
            form.append("file", files[0]);
            form.append("action", "change_user_img");
            Preloader.start();

            $.ajax({
                method: "POST",
                url: "api/user",
                processData: false,
                contentType: false,
                data: form,
                success: function (data) {
                    try {
                        data = JSON.parse(data);
                        if (typeof (data) !== "object") throw("Error");
                        if (data.result !== "true") throw("Error");

                        let image = new Image();
                        image.onload = () => $(".user_img").attr("src", image.src + "?" + performance.now());
                        image.src = data.data;

                        $("#save_image_button").hide();
                        $(canvas).hide();
                        $("#main_header .user_img").show();
                        new Notify("Изменение профиля", "Изображение профиля изменено");
                    } catch {
                        new Notify("Изменение профиля", "Изображение не было загружено");
                    }

                    Preloader.stop();
                }
            });
        })


        .on("click", "#main_header .user_name", function () {
            $("#user_name_input").val($(this).text());
            $(this).hide();
            $("#change_user_name").show();
        })


        .on("blur", "#user_name_input", function () {
            let userNameInput = $("#user_name_input");
            let name = userNameInput.val();
            if (!name) return true;

            Preloader.start();
            sendRequest("/api/user", {action: "change_user_name", name})
                .then(data => {
                    if (data.result === "true") {
                        $(".user_name").text(data.data);
                        new Notify("Изменение профиля", "Имя было обновлено");
                        return true;
                    }

                    if (data.data === "exists") return new Notify("Изменение профиля", "Данное имя уже занято другим игроком");
                    new Notify("Изменение профиля", "Имя не было обновлено. Попробуйте позже");
                })
                .finally(() => {
                    $("#change_user_name").hide();
                    $("#main_header .user_name").show();
                    Preloader.stop()
                });

        })

        .on("click", "#transfer_money", function () {
            $("#right_menu").removeClass("closed");
        })


        .on("input", "#transfer_sum_input", function () {
            if (!this.checkValidity()) return true;
            let sum = +$(this).val();
            let commission = Math.floor(sum * 0.1);
            $("#commission").text(commission);
            $("#total_sum").val(sum + commission);
        });

})();