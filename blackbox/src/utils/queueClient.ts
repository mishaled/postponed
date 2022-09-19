import Queue from 'bull';
import pify from 'pify';

const JOBS_QUEUE_NAME = `http://blackbox:3000jobs-queue`;

const queueClient = new Queue(JOBS_QUEUE_NAME, process.env.REDIS_URL);

export const didJobComplete = async (jobId: string): Promise<boolean> => {
    const promisifiedClient = pify(queueClient, {errorFirst: false, multiArgs: true});
    const result = await promisifiedClient.on('global:completed');

    queueClient.removeAllListeners();

    return jobId === result[0];
};

export default queueClient;
