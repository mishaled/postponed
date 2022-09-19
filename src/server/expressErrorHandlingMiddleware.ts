import {NextFunction, Request, Response} from 'express';
import logger from '../framework/logger';

export const expressErrorHandlingMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error(
        {
            err,
            extra: {
                method: req.method,
                path: req.path,
                body: req.body,
            },
        },
        'Exception occured in http request',
    );

    res.sendStatus(500);
};
