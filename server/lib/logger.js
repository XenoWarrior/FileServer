const constants = require("./constants");

class Logger {
    constructor() {

    }

    static fatal() {
        let args = Array.prototype.slice.call(arguments);
        let message = `[${constants.LOG_LEVEL_STR[process.env.LOG_LEVEL]}] ${args.join(" ")}`;

        if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.FATAL) {
            console.error(message)
        } else if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.FATAL) {
            console.error(message);
        }
    }

    static error() {
        let args = Array.prototype.slice.call(arguments);
        let message = `[${constants.LOG_LEVEL_STR[process.env.LOG_LEVEL]}] ${args.join(" ")}`;

        if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.ERROR) {
            console.error(message)
        } else if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.ERROR) {
            console.error(message);
        }
    }

    static warn() {
        let args = Array.prototype.slice.call(arguments);
        let message = `[${constants.LOG_LEVEL_STR[process.env.LOG_LEVEL]}] ${args.join(" ")}`;

        if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.WARN) {
            console.warn(message)
        } else if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.WARN) {
            console.warn(message);
        }
    }

    static info() {
        let args = Array.prototype.slice.call(arguments);
        let message = `[${constants.LOG_LEVEL_STR[process.env.LOG_LEVEL]}] ${args.join(" ")}`;

        if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.INFO) {
            console.log(message)
        } else if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.INFO) {
            console.log(message);
        }
    }

    static debug() {
        let args = Array.prototype.slice.call(arguments);
        let message = `[${constants.LOG_LEVEL_STR[process.env.LOG_LEVEL]}] ${args.join(" ")}`;

        if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.DEBUG) {
            console.debug(message)
        } else if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.DEBUG) {
            console.debug(message);
        }
    }

    static log() {
        let args = Array.prototype.slice.call(arguments);
        let message = `[${constants.LOG_LEVEL_STR[process.env.LOG_LEVEL]}] ${args.join(" ")}`;

        if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.ALL) {
            console.log(message);
        } else if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.ALL) {
            console.log(message);
        }
    }

    static trace() {
        let args = Array.prototype.slice.call(arguments);
        let message = `[${constants.LOG_LEVEL_STR[process.env.LOG_LEVEL]}] ${args.join(" ")}`;

        if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.ALL) {
            console.trace(message);
        } else if (process.env.LOG_LEVEL >= constants.LOG_LEVEL.TRACE) {
            console.trace(message);
        }
    }
}

module.exports = Logger;