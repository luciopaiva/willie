/**
 * Willie
 *
 * Willie encapsulates Winston and adds some extra functionality.
 *
 * Chill, Winston!
 *
 * @module willie
 */

"use strict";

var
    util = require('util'),
    moment = require('moment'),
    LEVELS = {
        SILLY:   { tag: '  silly', index: 0, color: 'magenta' },
        DEBUG:   { tag: '  debug', index: 1, color: 'cyan' },
        VERBOSE: { tag: 'verbose', index: 2, color: 'blue' },
        INFO:    { tag: '   info', index: 3, color: 'green' },
        WARN:    { tag: '   warn', index: 4, color: 'yellow' },
        ERROR:   { tag: '  error', index: 5, color: 'red' }
    },
    winston = require('winston'),
    levelNames = {}, levelColors = {},
    logger;

/**
 * @typedef {object} willieFunction
 * @returns {willie}
 */

/**
 * Definition of the object exported by this module
 *
 * @typedef {object} willie
 * @property {willieFunction} debug
 * @property {willieFunction} info
 * @property {willieFunction} error
 * @property {willieFunction} profile
 * @property {willieFunction} indent
 * @property {willieFunction} dedent
 * @property {willieFunction} hr
 * @property {willieFunction} initialize
 */

var
    willie,
    indentStr = '',
    indentLevel = 0,
    indentConst = '    ',
    config = {
        timestampFormat: 'HH:mm:ss.SSS',
        rollingDatePattern: '_yyyy-MM-dd.log',
        fileDatePattern: 'YYYYMMDD-HHmm',
        logDirectory: 'rotate',
        logToConsole: false
    };

/**
 * Base logging function
 *
 * @param {string} level
 * @param {...*} message
 * @returns {willie}
 */
function log(level, message) {

    /*
    arguments[0]: logging level
    arguments[1..n-3]: util.format params (e.g.: ['%s%s', 'foo', 'bar'])
    arguments[n-2]: meta information (optional)
    arguments[n-1]: callback (optional)
     */
    arguments[1] = indentStr + arguments[1]; // add indentation before passing to winston

    logger.log.apply(logger, arguments);

    return willie;
}

/**
 * Recalculate indentation
 *
 * @private
 */
function resolveIndent() {
    var
        i;

    indentStr = '';

    for(i = 0; i < indentLevel; i++) {
        indentStr += indentConst;
    }
}

/**
 * Increase indentation for future log messages
 *
 * @returns {willie}
 */
function indent() {

    indentLevel++;
    resolveIndent();
    return willie;
}

/**
 * Decrease indentation for future log messages
 *
 * @returns {willie}
 */
function dedent() {

    if (indentLevel > 0) indentLevel--;
    resolveIndent();
    return willie;
}

/**
 * Draw an horizontal line
 *
 * @returns {willie}
 */
function hr() {

    logger.log(LEVELS.INFO.tag, '--------------------------------------------------------------------------------');
    return willie;
}

/**
 * @private
 * @returns {string}
 */
function timeFormatFn() {

    return moment().format(config.timestampFormat);
}

/**
 * Winston profiler
 *
 * @param {string} id Profiler identifier
 * @param {...*} [msg] Optional message
 * @returns {willie}
 */
function profile(id, msg) {

    msg = indentStr + msg;
    logger.profile(id, msg);
    return willie;
}

/**
 * Log a block of text containing multiple lines
 *
 * Example:
 *     var data = '123\n456\n\n789';
 *     willie.logBlock(data, willie.info.bind(willie, 'data>');
 *
 * @param {string} block
 * @param {function} log
 * @returns {willie}
 */
function logBlock(block, log) {
    var
        lines;

    lines = block.split('\n');
    lines.forEach(function (line) {
        line = line.replace(/^\s+(.*?)\s+$/, '$1');
        if (line.length > 0) {
            log(line);
        }
    });

    return willie;
}

/**
 * Add console transport
 */
function logToConsole() {

    logger.add(winston.transports.Console, {
        level: LEVELS.INFO.tag,
        json: false,
        colorize: true,
        timestamp: timeFormatFn
    });

    return willie;
}

/**
 * Add file transport
 *
 * @param {string} filenamePrefix
 */
function logToFileWithTimestamp(filenamePrefix) {

    logger.add(winston.transports.File, {
        level: LEVELS.INFO.tag,
        json: false,
        colorize: true,
        filename: util.format('%s_%s.log', filenamePrefix, moment().format(config.fileDatePattern)),
        timestamp: timeFormatFn
    });

    return willie;
}

module.exports = (function () {

    Object.keys(LEVELS).forEach(function (levelName) {
        var
            level = LEVELS[levelName];

        levelNames[level.tag] = level.index;
        levelColors[level.tag] = level.color;
    });

    logger = new winston.Logger({
        level: LEVELS.INFO.tag,
        levels: levelNames,
        colors: levelColors
    });

    /** @type {willie} */
    willie = {
        debug: log.bind(logger, LEVELS.DEBUG.tag),
        info: log.bind(logger, LEVELS.INFO.tag),
        error: log.bind(logger, LEVELS.ERROR.tag),
        block: logBlock,
        profile: profile,
        indent: indent,
        dedent: dedent,
        hr: hr,
        logToConsole: logToConsole,
        logToFileWithTimestamp: logToFileWithTimestamp
    };

    return willie;
})();
