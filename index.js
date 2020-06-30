const { spawn } = require('child_process');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { log } = console;
const rightExitCode = 0;

const lintRepo = function (cloneURL) {
  log(`Cloning repo ${cloneURL}`);
  const child = spawn('git', ['clone', cloneURL]);
  return new Promise((res) => {
    child.on('exit', (code) => {
      if (code === rightExitCode) {
        log('installing eslint');
        const installEslint = spawn('npm', ['install', 'eslint']);
        const lintProcess = new Promise((res) => {
          installEslint.on('exit', (code) => {
            if (code === rightExitCode) {
              log('linting');
              const do_ = spawn('eslint', ['*.js']);
              do_.stdout.setEncoding('utf-8');
              do_.stdout.on('data', res);
              do_.on('exit', log);
            }
          });
        });
        res(lintProcess);
      }
    });
  });
};

app.use(bodyParser.json());
app.post('/github', (req, res) => {
  if (req.body.repository.clone_url) {
    lintRepo(req.body.repository.clone_url).then((data) => {
      log(data, 'done');
    });
  } else {
    res.send('invalid request');
  }
  res.end();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => log(`listening to ${PORT}`));
