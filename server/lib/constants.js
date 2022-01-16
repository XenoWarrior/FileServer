const constants = Object.freeze({
    LOG_LEVEL: {
        FATAL:   1,
        ERROR:   2,
        WARN:    3,
        INFO:    4,
        DEBUG:   5,
        TRACE:   6,
        ALL:     7
    },
    LOG_LEVEL_STR: {
        1: "FATAL",
        2: "ERROR",
        3: "WARN",
        4: "INFO",
        5: "DEBUG",
        6: "TRACE",
        7: "ALL"
    }
});

module.exports = constants;