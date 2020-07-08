const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
const {
  increment,
  lpush,
  hmset,
  hgetall,
  keys,
  scard,
} = require('./redisFunctions');

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
      const isValidGithubPayload =
        githubPayload.repository !== undefined &&
        githubPayload.head_commit !== undefined;
      if (!isValidGithubPayload) {
        throw new Error('Invalid Github Payload');
      }
      const jobDetails = getJobDetails(githubPayload, jobId, receivedAt);
      updateJobInRedis(client, jobId, jobDetails).then(() => {
        response.send(`Scheduled ${jobId}`);
      });
    })
    .catch((err) => {
      response.send(err.message);
      console.error('Unable to schedule job\n Reason: ', err.message);
    });
};

const generateResults = function (request, response) {
  const jobId = `job${request.params.id}`;
  hgetall(client, jobId)
    .then((jobDetails) => response.send(jobDetails))
    .catch((err) => response.send(`ERROR OCCURRED\n\n ${err.message}`));
};

const getAllJobs = function () {
  return new Promise((resolve, reject) => {
    keys(client, 'job*')
      .then((jobs) => {
        const jobDetails = jobs.map((job) => hgetall(client, job));
        Promise.all(jobDetails).then(resolve);
      })
      .catch(reject);
  });
};

const generateBenchmarkResults = function (request, response) {
  const jobType = request.params.jobType.toLocaleLowerCase();
  getAllJobs()
    .then((jobs) => {
      const benchmarkReport = jobs.map((job) => {
        return {
          jobId: job.jobId,
          receivedAt: job.receivedAt,
          queuedAt: job[`${jobType}ScheduledAt`],
          beganAt: job[`${jobType}StartedAt`],
          finishedAt: job[`${jobType}CompletedAt`],
        };
      });
      response.json(benchmarkReport);
    })
    .catch((err) => response.send(err));
};

const getCompleteJobCount = function (request, response) {
  const { jobType } = request.params;
  scard(client, `completed${jobType}Jobs`).then((completedJobCount) => {
    response.send(`${completedJobCount}`);
  });
};

app.get('/details', getAllJobs);
app.post('/payload', scheduleJob);
app.get('/results/:id', generateResults);
app.get('/benchmark/:jobType', generateBenchmarkResults);
app.get('/complete-job-count/:jobType', getCompleteJobCount);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
