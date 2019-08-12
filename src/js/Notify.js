class Notify {
    constructor(title, message) {
        let time = timeFormat(Date.now() / 1000);
        time = time.hours + ":" + time.minutes + ":" + time.seconds;
        let html = $(`
        <div class="notification closed">
            <div class="notification_header"><span>` + title + `</span><div class="close_notification">X</div></div>
            <div class="notification_body">
                <div class="notification_text">` + message + `</div>
                <div class="notification_time">` + time + `</div>
            </div>
        </div>`);
        $("#notifications").append(html);
        let dom = $(".notification.closed:last");
        dom.css({"margin-bottom": -dom[0].clientHeight + "px"});
        setTimeout(() => {
            $(".notification.closed:last").removeClass("closed");
            dom.animate({"margin-bottom": 10}, 500);
        }, 100);
        setTimeout(() => dom.animate({"height": 0, "opacity": 0}, 500, function () {
            $(this).remove();
        }), 5000);
    }
}