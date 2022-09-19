import pino from 'pino';

export default pino({
    level: 'debug',
    messageKey: 'message',
    formatters: {
        level: (label: string) => ({level: label}),
    },
});
