import axios from 'axios';

const SERVICE_URL = `http://${process.env.BULL_SCHEDULER_URL}:${process.env.BULL_SCHEDULER_PORT}`;

export const BULL_SCHEDULER_IS_ALIVE_URL = `${SERVICE_URL}/isAlive`;
export const BULL_SCHEDULER_JOBS_URL = `${SERVICE_URL}/job`;

const isAlive = async (): Promise<boolean> => {
    try {
        const response = await axios.get(BULL_SCHEDULER_IS_ALIVE_URL);

        return Boolean(response.data);
    } catch (err) {
        return false;
    }
};

const scheduleJob = async (jobRequest: {jobId?: string; jobData?: {}; delayInSec?: number}) => {
    const response = await axios.post(BULL_SCHEDULER_JOBS_URL, jobRequest);
    return response.data as string;
};

const removeJob = async (jobId: string) => await axios.delete(`${BULL_SCHEDULER_JOBS_URL}/${jobId}`);

export default {isAlive, scheduleJob, removeJob};
