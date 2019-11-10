const {Worker, parentPort, workerData} = require("worker_threads");
parentPort.postMessage(Date.now());