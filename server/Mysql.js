const mysql = require("mysql");
const mysqlConnection = mysql.createConnection({
    host: "127.0.0.1",
    port: "3306",
    user: "root",
    password: "root",
    database: "chat",
    charset: "utf8"
});

exports.Chat = class {
    constructor() {
    }

    start() {
        mysqlQuery(`CREATE TABLE IF NOT EXISTS \`chat\`
                    (
                        \`id\`      int(11) AUTO_INCREMENT PRIMARY KEY,
                        \`time\`    bigint(32) NOT NULL,
                        \`user_id\` int(11)    NOT NULL,
                        \`message\` text       NOT NULL
                    )`);
    }

    async insertMessage(time, userId, message) {
        [time, userId, message] = [mysqlConnection.escape(time), mysqlConnection.escape(userId), mysqlConnection.escape(message)];
        let result = await mysqlQuery("INSERT INTO `chat` (`time`, `user_id`, `message`) VALUES (" + time + ", " + userId + ", " + message + ")");
        return !result.error;
    }

};

async function mysqlQuery(sql) {
    let res = await new Promise(resolve => {
        mysqlConnection.query(sql, function (error, result) {
            resolve({
                error,
                result
            });
        });
    });
    return {error: res.error, result: res.result};
}

