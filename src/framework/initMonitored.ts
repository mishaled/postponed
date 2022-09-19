import {Monitor, PrometheusPlugin, setGlobalInstance} from 'monitored';
import logger from './logger';

const LogLevels = ['info', 'debug', 'warn', 'error'] as const;

const generateMonitoredLogger = () =>
    LogLevels.reduce((prev: {}, curr: string) => {
        prev[curr] = (message: string, data: {extra: {}}) => logger[curr](data, message);
        return prev;
    }, {});

export default () =>
    setGlobalInstance(
        new Monitor({
            logging: {
                logger: generateMonitoredLogger(),
                logErrorsAsWarnings: false,
                disableSuccessLogs: false,
            },
            plugins: [new PrometheusPlugin()],
            shouldMonitorExecutionStart: true,
        }),
    );
