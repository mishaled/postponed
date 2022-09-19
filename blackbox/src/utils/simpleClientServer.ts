import http from 'http';
import express, {Request} from 'express';
import {json} from 'body-parser';
import {default as stoppable} from 'stoppable';

const HTTP_PORT = process.env.HTTP_PORT;

let server: http.Server;

export const create = (
    callback: (req: Request) => Promise<void> | void,
    isAliveCallback: (req: Request) => Promise<boolean> | boolean = () => true,
) => {
    const app = express().use(json());

    app.post('/executeJob', async (req, res) => {
        try {
            await callback(req);
            res.sendStatus(200);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });

    app.get('/isAlive', async (req, res) => {
        const isAlive = await isAliveCallback(req);
        res.sendStatus(isAlive ? 200 : 500);
    });

    return new Promise<void>((resolve) => {
        server = app.listen(HTTP_PORT, () => {
            console.info(`HTTP server is RUNNING!`, {extra: {HTTP_PORT}});
            resolve();
        });
    });
};

export const stopHttpServerGracefully = () =>
    new Promise<{err: Error; gracefully: boolean}>((resolve) => {
        if (!server) resolve({err: undefined, gracefully: true});
        stoppable(server).stop((err, gracefully) => {
            resolve({err, gracefully});
        });
    });
