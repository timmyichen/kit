const cluster = require('cluster');
const os = require('os');

const startWorker = () => {
  const worker = cluster.fork();
  console.log(`CLUSTER: Worker ${worker.id} started`);
}

if (cluster.isMaster) {
  os.cpus().forEach(() => {
    startWorker();
  });
  
  cluster.on('disconnect', worker => {
    console.log(`CLUSTER: Worker ${worker.id} disconnected from the cluster`);
  });
  cluster.on('exit', (worker, code, signal) => {
    console.log(`CLUSTER: Worker ${worker.id} died with exit code ${code} (${signal})`);
    startWorker();
  });
} else {
  require('./app.js')();
}