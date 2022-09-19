import Queue, {JobOptions} from 'bull';
import {RedisOptions} from 'ioredis';
import {monitored} from 'monitored';
import {
    RETRY_DELAY_MS,
    REDIS_URL,
    JOBS_QUEUE_NAME,
    IS_REDIS_TLS,
    RETRY_ATTEMPTS,
    SHOULD_REDACT_JOB_DATA_IN_LOGS,
} from '../framework/environment';
import logger from '../framework/logger';
import {Job} from '../types';
import generateRedisClient from './generateRedisClient';

let queue: Queue.Queue | undefined;

export const isInitialized = (): boolean => !!queue;

export const initializeQueue = (): void => {
    queue = new Queue(JOBS_QUEUE_NAME, {
        createClient: (type: 'client' | 'subscriber' | 'bclient', redisOpts?: RedisOptions) =>
            generateRedisClient(REDIS_URL, IS_REDIS_TLS, type, redisOpts),
    });

    logger.info('Queue initialized', {extra: {queueName: JOBS_QUEUE_NAME}});
};

const getQueue = (): Queue.Queue => {
    if (!queue) {
        initializeQueue();
    }

    return queue as Queue.Queue;
};

export const scheduleNewJob = (job: Job, delayInSec: number): Promise<number | string> => {
    const jobOptions: JobOptions = {
        delay: delayInSec * 1000,
        removeOnComplete: true,
        removeOnFail: true,
        jobId: job.id,
        backoff: {
            type: 'exponential',
            delay: RETRY_DELAY_MS,
        },
        attempts: RETRY_ATTEMPTS,
    };

    const context = {
        jobId: job.id,
        jobOptions,
        jobData: SHOULD_REDACT_JOB_DATA_IN_LOGS ? 'REDACTED' : job.data,
    };

    return monitored(
        'schedule_new_job',
        async () => {
            const bullJob = await getQueue().add(job.data, jobOptions);
            return bullJob.id;
        },
        {logResult: true, context},
    );
};

export const removeJob = async (jobId: string): Promise<void> => {
    const context = {jobId};

    return monitored(
        'remove_job',
        async () => {
            const job = await getQueue().getJob(jobId);

            const isActive = await job?.isActive();
            Object.assign(context, {isActive});

            if (isActive) {
                logger.info({extra: context}, 'Job is active, cant remove it');
                return;
            }

            await job?.remove();
        },
        {context},
    );
};

export const process = getQueue().process.bind(queue);
