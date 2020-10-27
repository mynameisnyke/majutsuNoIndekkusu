
const Bottleneck = require('bottleneck'
)
const limiter = new Bottleneck({
  id: 'my_global_limiter',
  datastore: 'redis',
  clearDatastore: false,
  clientOptions: {
    host: '127.0.0.1',
    port: 6379,
  },
  reservoir: 50, // initial value
  reservoirRefreshAmount: 50,
  reservoirRefreshInterval: 300 * 1000, // must be divisible by 250
 
  // also use maxConcurrent and/or minTime for safety
  maxConcurrent: 5,
});

module.exports.limiter = limiter;