import logger from './logger';

export default () => {
    process.on('uncaughtException', (err: Error) => {
        logger.error({err}, 'An uncaught exception has happened');
    });

    process.on('unhandledRejection', (err: Error | any) => {
        logger.error({err}, 'handle disaster found uncaught rejection');
    });
};
