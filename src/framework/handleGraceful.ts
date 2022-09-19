import http from 'http';
import delay from 'delay';
import stoppable from 'stoppable';
import logger from './logger';

const stopHttpServerGracefully = (server: http.Server) =>
    new Promise<{err?: Error; gracefully: boolean}>((resolve) => {
        stoppable(server).stop((err, gracefully) => {
            resolve({err, gracefully});
        });
    });

export default ({httpServer}: {httpServer: http.Server}) => {
    process.on('SIGTERM', async () => {
        const failureThreshold = 2;
        const periodSecond = 2;
        const gracePeriod = 2;

        await delay((failureThreshold * periodSecond + gracePeriod) * 1000);

        await stopHttpServerGracefully(httpServer);
        await delay(100);

        logger.info('postponed is TERMINATED!!');
        process.exit();
    });
};
