const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
const { increment, lpush, hmset, hgetall, keys } = require('./lib/redisFunctions');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(morgan('dev'));

const getJobDetails = function (githubPayload, jobId, receivedAt) {
  const { head_commit, repository } = githubPayload;
  const { message, author, id, timestamp } = head_commit;
  const details = {
    receivedAt,
    jobId,
    lintingStatus: 'scheduled',
    testingStatus: 'scheduled',
    id: repository.id,
    repoName: repository.name,
    commitSHA: id,
    author: author.name,
    commitMessage: message,
    committedAt: timestamp,
    cloneUrl: repository.clone_url,
    lintScheduledAt: new Date().toJSON(),
    testScheduledAt: new Date().toJSON(),
  };
  const parsedDetails = Object.keys(details).reduce((parsed, detail) => {
    return [...parsed, detail, details[detail]];
  }, []);
  return parsedDetails;
};

const updateJobInRedis = function (client, jobId, jobDetails) {
  return new Promise((resolve, reject) => {
    hmset(client, jobId, jobDetails)
      .then(() => lpush(client, 'lintQueue', jobId))
      .then(() => lpush(client, 'testQueue', jobId))
      .then(() => {
        console.log(`Scheduled ${jobId}`);
        resolve();
      })
      .catch(reject);
  });
};

const scheduleJob = function (request, response) {
  const receivedAt = new Date().toJSON();
  increment(client, 'current_id')
    .then((id) => {
      const jobId = `job${id}`;
      const githubPayload = request.body;
      const jobDetails = getJobDetails(githubPayload, jobId, receivedAt);
      updateJobInRedis(client, jobId, jobDetails).then(() => {
        response.send(`Scheduled ${jobId}`);
      });
    })
    .catch((err) => {
      response.send('Invalid Github Payload');
      console.error('Unable to schedule job. Reason: ', err.message);
    });
};

const getJobById = function (request, response) {
  const { id } = request.params;
  const jobId = `job${id}`;
  hgetall(client, jobId)
    .then((jobDetails) => response.json(jobDetails))
    .catch((error) => response.send(error.message));
};

const getAllJobs = function () {
  return new Promise((resolve, reject) => {
    keys(client, 'job*')
      .then((jobIds) => {
        const jobDetails = jobIds.map((jobId) => hgetall(client, jobId));
        Promise.all(jobDetails).then(resolve);
      })
      .catch(reject);
  });
};

const sendAllJobDetails = function (request, response) {
  getAllJobs()
    .then((details) => {
      const jobData = details.reduce((allDetails, detail) => {
        const previousDetails = { ...allDetails };
        previousDetails[detail.jobId] = detail;
        return previousDetails;
      }, {});
      response.json(jobData);
    })
    .catch((err) => response.send(`${err}`));
};

app.post('/payload', scheduleJob);
app.get('/results', sendAllJobDetails);
app.get('/results/:id', getJobById);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
