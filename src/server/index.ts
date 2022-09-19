import {json} from 'body-parser';
import express, {RequestHandler, Router} from 'express';
import promBundle from 'express-prom-bundle';
import jobRoutes from './jobRoutes';
import isAliveRoute from './isAliveRoute';
import {expressErrorHandlingMiddleware} from './expressErrorHandlingMiddleware';
import metricsRoute from './metricsRoute';

const router = Router();

router.use(isAliveRoute);
router.use(metricsRoute);
router.use('/job', jobRoutes);

const app = express()
    .use(json() as RequestHandler)
    .use(router)
    .use(promBundle({includeMethod: true, includePath: true}))
    .use(expressErrorHandlingMiddleware);

export default app;
