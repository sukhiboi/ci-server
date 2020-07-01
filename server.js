const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const defaultPort = 4000;
app.use(bodyParser.json());

let id = 0;

const scheduleJob = function (req, res) {
  console.log(`scheduled job ${id}`);
  const jobDetails = Object.keys(req.body.repository).reduce((details, key) => {
    return [...details, key, req.body.repository[key]];
  }, []);
  client.hset(`job${id}`, jobDetails);
  client.lpush('queue', `job${id++}`, () => {
    res.send('scheduled');
  });
};

app.post('/payload', scheduleJob);

const PORT = process.env.PORT || defaultPort;
app.listen(PORT, () => console.log(`listening to ${PORT}`));
