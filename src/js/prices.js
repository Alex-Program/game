(function () {


    function getAllPrices() {
        sendRequest("api/user", {action: "get_all_prices"})
            .then(data => {
                for (let price of data.data) {
                    let parent = $(".price[data-name='" + price.name + "']");
                    if (parent.length < 1) continue;

                    parent.attr("data-value", price.price);
                    parent.find("input").val(price.price);
                }
            });
    }

    getAllPrices();

    $("body").on("click", ".save_button", function () {
        let parent = $(this).closest(".price");
        let name = parent.attr("data-name");
        let price = parent.find("input").val();
        let json = {
            action: "change_price",
            name,
            price
        };

        sendRequest("api/prices", json)
            .then(data => {
                let message = "Ошибка";
                if (data.result === "true") {
                    message = "Успешно";
                    parent.attr("data-value", price);
                }

                new Notify("Изменение цены", message);
            });
    })

        .on("click", ".cancel_button", function () {
            let parent = $(this).closest(".price");
            let defaultValue = parent.attr("data-value");
            parent.find("input").val(defaultValue);
        });

})();