let fs = require("fs");

exports.Files = class {
    src = "";
    encoding = "utf8";

    constructor(src, encoding = "utf8") {
        this.src = src;
        this.encoding = encoding;
    }

    async checkPath() {
        return new Promise(resolve => {
            fs.stat(this.src, function (error) {
                if (error) resolve(false);

                resolve(true);
            });
        });
    }

    async readFile() {
        return new Promise(async (resolve, reject) => {
            if(!await this.checkPath()) resolve("");

            fs.readFile(this.src, {encoding: this.encoding}, function (error, data) {
                if (error) reject(error);
                resolve(data);
            });
        });
    }

    async writeFile(data) {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.src, data, error => {
                if (error) reject(error);
                resolve(true);
            });
        });
    }

    async deleteFile() {
        return new Promise((resolve, reject) => {
            fs.unlink(this.src, error => {
                if (error) reject(error);
                resolve(true);
            });
        });
    }

}