const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const defaultPort = 4000;

app.use(bodyParser.json());

const jobs = [];
let id = 0;

const scheduleJob = function (req, res) {
  console.log(`scheduled job ${id}`);
  jobs.push({ ...req.body, id: id++ });
  res.send('scheduled');
};

app.post('/payload', scheduleJob);
app.get('/job', (req, res) => {
  if (jobs.length) {
    res.json(jobs.shift());
  } else {
    res.end('no job');
  }
});

const PORT = process.env.PORT || defaultPort;
app.listen(PORT, () => console.log(`listening to ${PORT}`));
