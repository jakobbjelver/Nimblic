// createWorker.js
import { wrap } from 'comlink';

export function createWorker() {
    const worker = new Worker(new URL('./fileWorker.js', import.meta.url), {
        type: 'module',
    });
    return wrap(worker);
}
