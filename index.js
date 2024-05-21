const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Load server.js on one core
  if (cluster.worker.id === 1) {
    require('./server');
  } else {
    // Load cli.js on another core
    require('./cli');
  }
}
