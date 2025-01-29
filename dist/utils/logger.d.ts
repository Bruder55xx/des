interface Logger {
    log: (level: LogLevel, message: string, value?: any) => void;
    info: (message: string, value?: any) => void;
    warn: (message: string, value?: any) => void;
    error: (message: string, value?: any) => void;
    success: (message: string, value?: any) => void;
    debug: (message: string, value?: any) => void;
}
type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug';
declare const logger: Logger;
export default logger;
