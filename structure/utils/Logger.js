const moment = require("moment");
const colors = require("colors")

class Logger {
    log(content, type = "log") {
        const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`.bold;
        switch (type) {
            case "log": {
                return console.log(`${timestamp} ${colors.blue.bold(type.toUpperCase())} ${content} `);
            }
            case "warn": {
                return console.log(`${timestamp} ${colors.yellow.bold(type.toUpperCase())} ${content} `);
            }
            case "error": {
                console.log(`${timestamp} ${colors.white.bold.bgRed(type.toUpperCase())} ${content} `);
                return console.error(content);
            }
            case "cmd": {
                return console.log(`${timestamp} ${colors.magenta.bold(type.toUpperCase())} ${content}`);
            }
            case "ready": {
                return console.log(`${timestamp} ${colors.green.bold(type.toUpperCase())} ${content}`);
            }
            case "info": {
                return console.log(`${timestamp} ${colors.cyan.bold(type.toUpperCase())} ${content}`);
            }
            case "debug": {
                return console.log(`${timestamp} ${colors.gray.bold(type.toUpperCase())} ${content}`);
            }
            default:
                throw new TypeError("The type of logger must be warn, debug, log, ready, cmd or error.");
        }
    }

    perm(type = "permission") {
        const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`.bold;
        switch (type) {
        case "permission": {
            return console.log(`${timestamp} ${colors.yellow.bold(type.toUpperCase())} Permission missing from bot.`);
        }
        default:
            throw new TypeError("The type of logger must be permission.");
        }
    }

    error(content) {
        return this.log(content, "error");
    }
    debug(content) {
        return this.log(content, "debug");
    }
    cmd(content) {
        return this.log(content, "cmd");
    }
}

module.exports = Logger;