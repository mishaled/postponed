# postponed

An HTTP sidecar service, wrapping the great open source [bull library](https://github.com/OptimalBits/bull), for easy to use job scheduling.
Bull is stable, well docummented library, that uses Redis as an underlying DB to manage jobs and queues.
The sidecar behaved as both the producer and the consumer of the defined job type/queue.
Exposes prometheus metrics for monitoring and alerts

## Motivation

-   Need X to happen Y minutes from now
-   Possibly long periods of time- an hour or more

Example:

Say we have a chat service, where, when a user receives a message, he needs to be reminded or notified to read it after 1 minute, if he hasn't done so yet.
So we have a service, which listens to some kind of message queue, and upon each arriving message, it schedules a job to be executed in 1 minute.
The job is scheduled via sending a request to the sidecar's POST endpoint, and scheduling a job with all the necesary data in it (the recepient's and sender's id and name).
When the job's turn arrives, the sidecar sends a POST request to a predefined endpoint on the service, with all the job's data (that was send to the sidecar), and then the service can check if the user has already seen the message, and notify him if not.

## How to install

The docker image is hosted on docker hub and can be found here: https://hub.docker.com/r/soluto/postponed/

An example kubernetes replication controller can be found in the examples directory.

## API

Exposes a simple api

-   Schedule a Job

    -   http://localhost:**HTTP_PORT**

        -   POST

        -   Will call the host back when the job is active on `TARGET_BASE_PATH + TARGET_PROCESS_RELATIVE_PATH` via a post request with the `jobData` as the body

        -   Expected body

            ```typescript
            {
                jobId?: string;
                jobData: Record<string, any>;
                delayInSec: number;
            }
            ```

-   Remove a Job
    -   http://localhost:**HTTP_PORT**/:id
        -   DELETE
        -   `id` is the id of the job we need to remove

## Environment configuration variables

| Parameter                        | Description                                                                                       | Default                 | Mandatory | Secret |
| -------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------- | --------- | ------ |
| `REDIS_URL`                      | The redis cache url                                                                               |                         | true      | true   |
| `RETRY_DELAY_MS`                 | Time to wait before retrying to add to cache                                                      | `2000`                  | false     | false  |
| `HTTP_PORT`                      | The port to use                                                                                   | `3000`                  | false     | false  |
| `TARGET_BASE_PATH`               | Target base path                                                                                  | `http://localhost:3000` | false     | false  |
| `TARGET_PROCESS_RELATIVE_PATH`   | Target message processor path                                                                     | `/executeJob`           | false     | false  |
| `TARGET_IS_ALIVE_RELATIVE_PATH`  | Target is alive path                                                                              | `isAlive`               | false     | false  |
| `JOBS_QUEUE_NAME`                | The table name in redis to store the items                                                        | `jobs-queue`            | false     | false  |
| `IS_REDIS_TLS`                   | Should connect to redis with tls                                                                  | `false`                 | false     | false  |
| `MAX_CONCURRENCY`                | The maximal number of concurrent processes                                                        | `5`                     | false     | false  |
| `PROCESS_TIMEOUT_MS`             | Time after which the process times out in miliseconds                                             | `10000`                 | false     | false  |
| `RETRY_ATTEMPTS`                 | The maximal number of retries                                                                     | `3`                     | false     | false  |
| `SHOULD_REDACT_JOB_DATA_IN_LOGS` | Should redact the job.data from the logs, can be disabled if the data is not sensitive (PII etc.) | `true`                  | false     | false  |

# Exposed Prometheus Metrics

| Name                            | Type      | Description                                                        |
| ------------------------------- | --------- | ------------------------------------------------------------------ |
| schedule_new_job_start          | Counter   | Incremented each time the process of scheduling a new job starts   |
| schedule_new_job_success        | Counter   | Incremented each time the process of scheduling a new job succeeds |
| schedule_new_job_error          | Counter   | Incremented each time the process of scheduling a new job fails    |
| schedule_new_job_execution_time | Histogram | Represents the time it takes to schedule a new job                 |
| remove_job_start                | Counter   | Incremented each time the process of removing a job starts         |
| remove_job_success              | Counter   | Incremented each time the process of removing a job succeeds       |
| remove_job_error                | Counter   | Incremented each time the process of removing a job fails          |
| remove_job_execution_time       | Histogram | Represents the time it takes to remove a job                       |
| process_job_start               | Counter   | Incremented each time the processing of a job starts               |
| process_job_success             | Counter   | Incremented each time the processing of a job succeeds             |
| process_job_error               | Counter   | Incremented each time the processing of a job fails                |
| process_job_execution_time      | Histogram | Represents the time it takes to process job                        |
