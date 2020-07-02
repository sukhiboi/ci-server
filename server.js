const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const defaultPort = 4000;
app.use(bodyParser.json());

const getJobDetails = function (payload, jobId) {
  const { id, clone_url, name } = payload.repository;
  const [commit] = payload.commits;
  const { message, author } = commit;
  const repoDetails = ['cloneUrl', clone_url, 'repoName', name, 'id', id];
  const commitDetails = ['author', author.name, 'commitMessage', message];
  const jobDetails = ['status', 'scheduled', 'jobId', jobId];
  return [
    ...repoDetails,
    ...commitDetails,
    ...jobDetails,
    'scheduledAt',
    new Date().toJSON(),
  ];
};

const createJob = function (id, req) {
  return new Promise((res, rej) => {
    client.hmset(`job${id}`, getJobDetails(req.body, id), (err) => {
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
      if (!req.body.repository) {
        return res.send('Invalid options');
      }
      createJob(id, req).then(() => {
        client.lpush('lintQueue', `job${id}`, () => {
          client.lpush('testQueue', `job${id}`, () => {
            res.send(`scheduled | job id ${id}`);
          });
        });
      });
    }
  });
};

app.post('/payload', scheduleJob);
app.get('/lint-results/:id', (req, res) => {
  client.hgetall(`job${req.params.id}`, (err, reply) => {
    if (err) {
      res.end('invalid id');
    } else {
      res.end(JSON.stringify(reply));
    }
  });
});

const PORT = process.env.PORT || defaultPort;
app.listen(PORT, () => console.log(`listening to ${PORT}`));
