const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers for server.js
  for (let i = 0; i < numCPUs - 1; i++) {
    cluster.fork();
  }

  // Fork one worker for cli.js
  cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // If the worker is for cli.js
  if (cluster.worker.id === numCPUs) {
    require('./cli');
  } else {
    // If the worker is for server.js
    require('./server');
  }
}
