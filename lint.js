const { readFileSync, existsSync, writeFileSync } = require('fs');
const { exec } = require('child_process');
const Listr = require('listr');

const cloneRepo = function (cloneURL) {
  return new Promise((res) => {
    exec(`git clone ${cloneURL}`, (err, stdout) => {
      if (err) {
        throw new Error(err);
      }
      res(stdout);
    });
  });
};

const installEslint = function (repoName) {
  return new Promise((res) => {
    exec(`cd ${repoName}; npm init -y; npm install eslint`, (err, stdout) => {
      if (err) {
        throw new Error(err);
      }
      res(stdout);
    });
  });
};

const checkEslintrc = function (repoName) {
  return new Promise((res) => {
    const isLintFileAvailable = existsSync(`./${repoName}/.eslintrc`);
    if (!isLintFileAvailable) {
      writeFileSync(`./${repoName}/.eslintrc`, readFileSync('./.eslintrc'));
    }
    const isListIgnore = existsSync(`./${repoName}/.eslintignore`);
    if (!isListIgnore) {
      writeFileSync(`./${repoName}/.eslintignore`, 'node_modules');
    }
    res();
  });
};

const lint = function (repoName, req, response) {
  return new Promise((res) => {
    exec(`cd ${repoName}; eslint ./**/*.js`, (err, stdout, stderr) => {
      const eslintReport = { ...req.body, eslint: { warnings: stdout } };
      if (err) {
        eslintReport.eslint = { errors: stderr, warnings: stdout };
      }
      response.end(JSON.stringify(eslintReport));
      res();
    });
  });
};

const deleteLocalRepo = function (repoName) {
  return new Promise((res) => {
    if (repoName) {
      exec(`rm -rf ${repoName}`, res);
    }
  });
};

const lintRepo = function (req, res) {
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
      task: () => lint(repoName, req, res),
    },
    {
      title: 'deleting local repo',
      task: () => deleteLocalRepo(repoName),
    },
  ]);
  console.log(`Processing ${repoName}`);
  tasks.run();
};

module.exports = { lintRepo };
