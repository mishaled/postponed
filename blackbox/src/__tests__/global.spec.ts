import 'mocha';
import logger from '../utils/logger';

// For the CI test reporting, we need only json logs to be written, and hence we need to disable the default console logger
if (process.env.ENV === 'ci') {
    before(() => {
        logger.mock();
    });

    after(() => {
        logger.restore();
    });
}
