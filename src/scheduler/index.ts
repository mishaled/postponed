import {MAX_CONCURRENCY} from '../framework/environment';
import {process} from './queueClient';
import processJob from './processJob';
export {scheduleNewJob, removeJob, initializeQueue} from './queueClient';

export * from '../types';

export const startProcessing = () => process(MAX_CONCURRENCY, processJob);
