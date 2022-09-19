import {Request} from 'express';
import Joi from 'joi';

type JobData = Record<string, any>;
type ResponseHeaders = Record<string, string>;

type BullJobData = {
    jobData?: Record<string, any>;
    responseHeaders?: ResponseHeaders;
};

export interface Job {
    id?: string | number;
    data?: BullJobData;
}

type JobRequestBody = {
    jobId?: string;
    jobData?: JobData;
    delayInSec: number;
    responseHeaders?: ResponseHeaders;
};

export interface JobRequest extends Request {
    body: JobRequestBody;
}

export const JobRequestBodySchema = Joi.object<JobRequestBody>({
    jobId: Joi.string().optional(),
    jobData: Joi.object().optional(),
    delayInSec: Joi.number().required(),
    responseHeaders: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
});
