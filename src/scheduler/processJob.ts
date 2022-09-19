import Queue from 'bull';
import axios, {AxiosError} from 'axios';
import axiosRetry from 'axios-retry';
import {monitored} from 'monitored';
import {
    PROCESS_TIMEOUT_MS,
    RETRY_ATTEMPTS,
    RETRY_DELAY_MS,
    SHOULD_REDACT_JOB_DATA_IN_LOGS,
    TARGET_PROCESS_PATH,
} from '../framework/environment';
import {Job} from '../types';

axiosRetry(axios, {
    retries: RETRY_ATTEMPTS,
    retryDelay: () => RETRY_DELAY_MS,
});

export default async (job: Queue.Job<Job>) => {
    const context = {
        ...job.toJSON(),
        data: SHOULD_REDACT_JOB_DATA_IN_LOGS ? 'REDACTED' : job.data,
    };

    return monitored(
        'process_job',
        async () => {
            try {
                await axios.post(TARGET_PROCESS_PATH, job.data.data, {
                    timeout: PROCESS_TIMEOUT_MS,
                    headers: job.data.data?.responseHeaders,
                });
            } catch (err) {
                const axiosError = err as AxiosError;
                throw new Error((axiosError.response?.data as string) ?? axiosError.message);
            }
        },
        {context},
    );
};
