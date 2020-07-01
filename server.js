const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const defaultPort = 4000;
app.use(bodyParser.json());

const createJob = function (id, req) {
  return new Promise((res, rej) => {
    const { clone_url, name } = req.body.repository;
    client.hmset(`job${id}`, ['clone_url', clone_url, 'name', name], (err) => {
      if (err) {
        rej('unable to create job');
      } else {
        res();
      }
    });
  });
};

const scheduleJob = function (req, res) {
  client.incr('current_id', (err, id) => {
    console.log(`Scheduling job ${id}`);
    if (err) {
      console.error('unable to increment id');
    } else {
      createJob(id, req).then(() => {
        client.lpush('queue', `job${id}`, () => {
          res.send(`scheduled | job id ${id}`);
        });
      });
    }
  });
};

app.post('/payload', scheduleJob);

const PORT = process.env.PORT || defaultPort;
app.listen(PORT, () => console.log(`listening to ${PORT}`));
