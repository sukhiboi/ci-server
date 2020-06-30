const { spawn } = require('child_process');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { log } = console;
const rightExitCode = 0;

const lintRepo = function (cloneURL) {
  const child = spawn('git', ['clone', cloneURL]);
  child.on('exit', (code) => {
    if (code === rightExitCode) {
      log('installing eslint');
      const installEslint = spawn('npm', ['install', 'eslint']);
      installEslint.on('exit', (code) => {
        if (code === rightExitCode) {
          log('linting');
          const do_ = spawn('eslint', ['*.js']);
          do_.stdout.setEncoding('utf-8');
          do_.stdout.on('data', log);
          do_.on('exit', log);
        }
      });
    }
  });
};

app.use(bodyParser.json());
app.post('/github', (req, res) => {
  if (req.body.clone_url) {
    typeof req.body;
    log(req.body.clone_url);
    lintRepo(req.body.clone_url);
    res.send(`working on ${req.body.repository.fullname}`);
  }
  res.send('invalid request');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => log(`listening to ${PORT}`));
