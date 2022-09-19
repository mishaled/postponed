import 'mocha';
import delay from 'delay';
import {v4 as uuid} from 'uuid';
import {expect} from 'chai';
import {AxiosError} from 'axios';
import jobScheduler from '../utils/jobScheduler';
import queueClient, {didJobComplete} from '../utils/queueClient';
import {createService, stopHttpServerGracefully} from '../utils';

describe('Scheduler', () => {
    afterEach(async () => {
        await stopHttpServerGracefully();
        await queueClient.empty();
    });

    after(() => queueClient.close());

    it('check is alive - false', async () => {
        await createService(
            () => {},
            () => false,
        );
        const res = await jobScheduler.isAlive();
        expect(res).to.be.equal(false);
    });

    it('check is alive - true', async () => {
        await createService(
            () => {},
            () => true,
        );
        const res = await jobScheduler.isAlive();
        expect(res).to.be.equal(true);
    });

    it('should schedule an item for 1 sec from now', async () => {
        let receivedData;
        let jobDelayTime = 1;
        const jobRequest = {
            jobId: uuid(),
            jobData: {foo: 'bar'},
            delayInSec: jobDelayTime,
        };
        let receiveTime: number;
        await createService((data) => {
            receiveTime = Date.now();
            receivedData = data.body;
        });
        const sendTime = Date.now();

        const jobId = await jobScheduler.scheduleJob(jobRequest);

        expect(jobId).to.equal(jobRequest.jobId);
        const isJobCompletes = await didJobComplete(jobId);
        expect(isJobCompletes).to.true;
        const jobWaitTime = receiveTime - sendTime;
        expect(jobWaitTime).to.be.approximately(jobDelayTime * 1000, 2000, `job wasn't handled on time`);
        expect(receivedData).to.deep.equal(jobRequest.jobData);
    });

    it('id not provided - should generate a new one', async () => {
        let jobDelayTime = 1;
        const jobRequest = {
            jobData: {foo: 'bar'},
            delayInSec: jobDelayTime,
        };
        let receiveTime: number;
        await createService((_data) => {
            receiveTime = Date.now();
        });

        const jobId = await jobScheduler.scheduleJob(jobRequest);

        expect(jobId).to.exist;
    });

    it('delayInSec not provided - should return 400', async () => {
        const jobRequest = {
            jobData: {foo: 'bar'},
        };
        await createService(() => {});

        try {
            await jobScheduler.scheduleJob(jobRequest);
        } catch (err) {
            expect((err as AxiosError).response.status).to.be.equal(400);
            return;
        }

        expect.fail();
    });

    it('jobData not provided - should succeed', async () => {
        let jobDelayTime = 1;
        const jobRequest = {
            delayInSec: jobDelayTime,
        };
        await createService(() => {});

        const jobId = await jobScheduler.scheduleJob(jobRequest);

        expect(jobId).to.exist;
    });

    it('should remove a scheduled job', async () => {
        let jobDelayTime = 5;
        const jobRequest = {
            jobId: uuid(),
            jobData: {foo: 'bar'},
            delayInSec: jobDelayTime,
        };
        await createService(() => {});

        const jobId = await jobScheduler.scheduleJob(jobRequest);
        const jobBefore = await queueClient.getJob(jobId);
        expect(jobBefore).to.exist;
        await jobScheduler.removeJob(jobId);

        const jobAfter = await queueClient.getJob(jobId);
        expect(jobAfter).to.not.exist;
    });

    it('Job doesnt exist - remove shouldnt fail', async () => {
        await createService(() => {});

        const result = await jobScheduler.removeJob(uuid());

        expect(result.status).to.be.equal(200);
    });

    it('Job is active - remove shouldnt fail', async () => {
        await createService(() => delay(2000));

        const jobId = uuid();
        await queueClient.add({}, {jobId});
        await delay(1000);
        const job = await queueClient.getJob(jobId);

        const state = await job.getState();
        expect(state).to.be.equal('active');

        const result = await jobScheduler.removeJob(jobId);

        expect(result.status).to.be.equal(200);
    });

    it('should retry twice', async () => {
        const jobRequest = {
            jobId: uuid(),
            jobData: {foo: uuid()},
            delayInSec: 0,
        };

        let attempts = 0;
        const expectedError = uuid();
        await createService(() => {
            attempts++;
            throw new Error(expectedError);
        });

        await jobScheduler.scheduleJob(jobRequest);

        await new Promise<void>((resolve, reject) => {
            queueClient.on('global:failed', (jobId, err, ...rest) => {
                try {
                    expect(jobId).to.be.equal(jobId);
                    expect(err).to.be.equal(expectedError);
                    expect(attempts).to.equal(2);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });

    it('should timeout correctly', async () => {
        await createService(() => delay(3500));

        const jobId = uuid();
        await queueClient.add({}, {jobId});
        const startTime = Date.now();

        await new Promise<void>((resolve, reject) => {
            queueClient.on('global:failed', (jobId, err) => {
                try {
                    expect(jobId).to.be.equal(jobId);
                    expect(err).to.be.equal(`timeout of ${process.env.PROCESS_TIMEOUT_MS}ms exceeded`);
                    expect(Date.now() - startTime).to.be.approximately(parseInt(process.env.PROCESS_TIMEOUT_MS), 500);
                    resolve();
                } catch (err) {
                    reject(err);
                }
            });
        });
    });

    it('should send response headers to the process endpoint', async () => {
        const expectedHeaders = {
            [uuid()]: uuid(),
        };

        return new Promise<void>(async (resolve, reject) => {
            await createService((request) => {
                try {
                    expect(request.headers).to.deep.include(expectedHeaders);

                    resolve();
                } catch (err) {
                    reject(err);
                }
            });

            await jobScheduler.scheduleJob({delayInSec: 0, jobData: {responseHeaders: expectedHeaders}, jobId: uuid()});
        });
    });
});
