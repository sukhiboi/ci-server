const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
const { increment, lpush, hmset, hgetall } = require('./redisFunctions');

const getJobDetails = function (githubPayload, jobId) {
  const { head_commit, repository } = githubPayload;
  const { message, author, id, timestamp } = head_commit;
  const details = {
    jobId,
    status: 'scheduled',
    id: repository.id,
    repoName: repository.name,
    commitSHA: id,
    author: author.name,
    commitMessage: message,
    committedAt: timestamp,
    cloneUrl: repository.clone_url,
    scheduledAt: new Date().toJSON(),
  };
  const parsedDetails = Object.keys(details).reduce((parsed, detail) => {
    return [...parsed, detail, details[detail]];
  }, []);
  return parsedDetails;
};

const scheduleJob = async function (request, response) {
  try {
    const id = await increment(client, 'current_id');
    const jobId = 'job' + id;
    const githubPayload = request.body;
    if (githubPayload.repository === undefined) {
      throw new Error('Invalid Github Payload');
    }
    const jobDetails = getJobDetails(githubPayload, jobId);
    await hmset(client, jobId, jobDetails);
    await lpush(client, 'lintQueue', jobId);
    await lpush(client, 'testQueue', jobId);
    console.log(`Scheduled ${jobId}`);
    response.send(`Scheduled ${jobId}`);
  } catch (err) {
    response.send(err.message);
    console.error('Unable to schedule job\n Reason: ', err.message);
  }
};

const generateLintResults = async function (request, response) {
  try {
    const jobId = `job${request.params.id}`;
    const jobDetails = await hgetall(client, jobId);
    response.send(JSON.stringify(jobDetails));
  } catch (err) {
    response.send(`ERROR OCCURRED\n\n ${err.message}`);
  }
};

app.use(bodyParser.json());
app.get('/', (request, response) => response.send('Welcome to step-ci'));
app.post('/payload', scheduleJob);
app.get('/lint-result/:id', generateLintResults);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
