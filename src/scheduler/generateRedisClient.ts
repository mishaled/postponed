import Redis, {RedisOptions} from 'ioredis';
import logger from '../framework/logger';

const generateRedisOptions = (
    redisOpts: Redis.RedisOptions | undefined,
    redisUrl: string,
    isSslConnection: boolean,
    type: string,
): Redis.RedisOptions => {
    const parsedRedisUrl = new URL(redisUrl);

    return {
        ...redisOpts,
        password: parsedRedisUrl.password,
        host: parsedRedisUrl.hostname,
        port: parseInt(parsedRedisUrl.port),
        ...(isSslConnection && {tls: {}}),
        ...(['bclient', 'subscriber'].includes(type) && {
            enableReadyCheck: false,
            maxRetriesPerRequest: null,
        }),
    };
};

const subscribeLoggerToRedisEvents = (client: Redis.Redis, context: {}) => {
    ['ready', 'connect', 'reconnecting', 'close', 'end', 'wait', 'select'].map((eventName) =>
        client.on(eventName, () =>
            logger.info(
                {
                    extra: {
                        ...context,
                        eventName,
                    },
                },
                `redis is ${eventName}-ing`,
            ),
        ),
    );

    client.on('error', (err) => logger.error({err, extra: context}, 'redis had an error'));
};

export default (
    redisUrl: string,
    isSslConnection: boolean,
    type: 'client' | 'subscriber' | 'bclient',
    redisOpts?: RedisOptions,
) => {
    const options: RedisOptions = generateRedisOptions(redisOpts, redisUrl, isSslConnection, type);

    const client = new Redis(options);

    const context = {
        isSslConnection,
        type,
        options: {...options, password: '******'},
    };

    logger.info({extra: context}, 'generated ioredis client');

    subscribeLoggerToRedisEvents(client, context);

    return client;
};
