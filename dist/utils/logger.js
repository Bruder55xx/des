"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const logger = {
    log: (level, message, value = '') => {
        const now = new Date().toLocaleString();
        const colors = {
            info: chalk_1.default.cyanBright,
            warn: chalk_1.default.yellow,
            error: chalk_1.default.redBright,
            success: chalk_1.default.greenBright,
            debug: chalk_1.default.magentaBright,
        };
        const color = colors[level] || chalk_1.default.white;
        const levelTag = `[ ${level.toUpperCase()} ]`;
        const timestamp = `[ ${now} ]`;
        const formattedMessage = `${chalk_1.default.blue("[ DeSpeedBot ]")} ${chalk_1.default.grey(timestamp)} ${color(levelTag)} ${message}`;
        // Handle the value formatting separately for consistency
        let formattedValue = ` ${chalk_1.default.green(value)}`;
        if (level === 'error') {
            formattedValue = ` ${chalk_1.default.red(value)}`;
        }
        else if (level === 'warn') {
            formattedValue = ` ${chalk_1.default.yellow(value)}`;
        }
        if (value) {
            const valueColor = level === 'error' ? chalk_1.default.redBright : chalk_1.default.greenBright;
            formattedValue = typeof value === 'object'
                ? ` ${valueColor(JSON.stringify(value))}` // Pretty-print objects
                : ` ${valueColor(value)}`;
        }
        console.log(`${formattedMessage}${formattedValue}`);
    },
    info: (message, value = '') => logger.log('info', message, value),
    warn: (message, value = '') => logger.log('warn', message, value),
    error: (message, value = '') => logger.log('error', message, value),
    success: (message, value = '') => logger.log('success', message, value),
    debug: (message, value = '') => logger.log('debug', message, value),
};
exports.default = logger;
//# sourceMappingURL=logger.js.map