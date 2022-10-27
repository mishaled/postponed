import * as env from 'env-var';
const {name, version} = require('../../package.json');

const getString = (key: string) => env.get(key).required().asString();

const getNumberWithDefault = (key: string, defaultValue: number) => env.get(key).asInt() ?? defaultValue;

const getStringWithDefault = (key: string, defaultValue: string) => env.get(key).asString() ?? defaultValue;

const getBooleanWithDefault = (key: string, defaultValue: boolean) => env.get(key).asBool() ?? defaultValue;

export const NODE_ENV = getString('NODE_ENV');
export const HTTP_PORT = getNumberWithDefault('HTTP_PORT', 3000);
export const RETRY_DELAY_MS = getNumberWithDefault('RETRY_DELAY_MS', 2000);
export const RETRY_ATTEMPTS = getNumberWithDefault('RETRY_ATTEMPTS', 3);
export const TARGET_BASE_PATH = getStringWithDefault('TARGET_BASE_PATH', 'http://localhost:3000');
export const TARGET_PROCESS_PATH = `${TARGET_BASE_PATH}${getStringWithDefault(
    'TARGET_PROCESS_RELATIVE_PATH',
    '/executeJob',
)}`;
export const TARGET_IS_ALIVE_PATH = `${TARGET_BASE_PATH}${getStringWithDefault(
    'TARGET_IS_ALIVE_RELATIVE_PATH',
    '/isAlive',
)}`;
export const JOBS_QUEUE_NAME = `${TARGET_BASE_PATH}${getStringWithDefault('JOBS_QUEUE_NAME', 'jobs-queue')}`;
export const IS_REDIS_TLS = getBooleanWithDefault('IS_REDIS_TLS', false);
export const MAX_CONCURRENCY = getNumberWithDefault('MAX_CONCURRENCY', 5);
export const PROCESS_TIMEOUT_MS = getNumberWithDefault('PROCESS_TIMEOUT_MS', 10000);
export const SHOULD_REDACT_JOB_DATA_IN_LOGS = getBooleanWithDefault('SHOULD_REDACT_JOB_DATA_IN_LOGS', true);

export const REDIS_URL = getString('REDIS_URL');

export const IS_PROD = NODE_ENV === 'production';
export const SERVICE_NAME = name;
export const SERVICE_VERSION = version;
