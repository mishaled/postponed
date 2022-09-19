import {Request} from 'express';
import {AsyncRouter} from 'express-async-router';
import * as expressJoiValidation from 'express-joi-validation';
import {removeJob, scheduleNewJob} from '../scheduler';
import {JobRequest, JobRequestBodySchema} from '../types';

const router = AsyncRouter();

const validator = expressJoiValidation.createValidator({});

router.post(
    '/',
    validator.body(JobRequestBodySchema),
    ({body: {jobId, jobData, delayInSec, responseHeaders}}: JobRequest) => {
        const data = (jobData || responseHeaders) && {
            data: jobData,
            responseHeaders,
        };

        const bullJobData = {id: jobId, data: data};

        return scheduleNewJob(bullJobData, delayInSec);
    },
);

router.delete('/:id', async ({params: {id: jobId}}: Request) => removeJob(jobId));

export default router;
