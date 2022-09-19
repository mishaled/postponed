import {Router} from 'express';
import {register} from 'prom-client';

const router = Router();

router.get('/metrics', async (_, res) => {
    const metrics = await register.metrics();
    res.send(metrics);
});

export default router;
