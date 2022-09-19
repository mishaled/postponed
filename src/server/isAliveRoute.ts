import axios from 'axios';
import {Router} from 'express';
import {TARGET_IS_ALIVE_PATH} from '../framework/environment';
import {isInitialized} from '../scheduler/queueClient';
import logger from '../framework/logger';

const router = Router();

router.get('/isAlive', async (_, res) => {
    try {
        if (!isInitialized()) {
            res.status(500).send("Couldn't connect to the queue");
            return;
        }

        const result = await axios.get(TARGET_IS_ALIVE_PATH);
        res.sendStatus(result.status);
    } catch {
        logger.info({extra: {TARGET_IS_ALIVE_PATH}}, 'failed to check if the target is alive');
        res.sendStatus(500);
    }
});

export default router;
