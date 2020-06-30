const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Listr = require('listr');
const {
  cloneRepo,
  installEslint,
  checkEslintrc,
  lint,
  deleteLocalRepo,
} = require('./task');
const { log } = console;

const lintRepo = function (req, response) {
  const cloneURL = req.body.repository.clone_url;
  const repoName = req.body.repository.name;
  const tasks = new Listr([
    {
      title: 'cloning repo',
      task: () => cloneRepo(cloneURL),
    },
    {
      title: 'installing eslint',
      task: () => installEslint(repoName),
    },
    {
      title: 'checking .eslintrc',
      task: () => checkEslintrc(repoName),
    },
    {
      title: 'linting',
      task: () => lint(repoName, response),
    },
    {
      title: 'deleting local repo',
      task: () => deleteLocalRepo(repoName),
    },
  ]);
  tasks.run();
};

app.use(bodyParser.json());
app.post('/github', lintRepo);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => log(`listening to ${PORT}`));
