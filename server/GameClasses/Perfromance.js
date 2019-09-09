const {performance} = require('perf_hooks');

exports.Performance = class Performance {

    static now() {
        return Math.floor(performance.now());
    }

};