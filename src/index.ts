import 'dotenv/config';

import handleDisaster from './framework/handleDisaster';
import handleGraceful from './framework/handleGraceful';
import expressServer from './server';
import {HTTP_PORT} from './framework/environment';
import {initializeQueue, startProcessing} from './scheduler';
import logger from './framework/logger';
import initMonitored from './framework/initMonitored';

(async () => {
    try {
        handleDisaster();
        initMonitored();
        initializeQueue();

        const httpServer = expressServer.listen(HTTP_PORT, () => {
            logger.info({extra: {HTTP_PORT}}, `HTTP server is RUNNING!`);
        });

        await startProcessing();

        handleGraceful({httpServer});
    } catch (error) {
        logger.error({err: error}, 'error caught at index');
    }
})();
