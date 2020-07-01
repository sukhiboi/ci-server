const http = require('http');
const { lintRepo } = require('./lint');

const options = {
  host: 'localhost',
  path: '/job',
  method: 'GET',
  port: 4000,
};

const getJob = function () {
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      if (!(data === 'no job')) {
        const payload = JSON.parse(data);
        console.log(`working on job ${payload.id}`);
        lintRepo(payload).then(() => {
          setTimeout(getJob, 1000);
        });
      } else {
        console.log('worker idle');
        setTimeout(getJob, 1000);
      }
    });
  });
  req.end();
};

getJob();
