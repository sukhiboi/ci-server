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

const lint = function (repoName, payload) {
  return new Promise((res) => {
    exec(`eslint ${repoName}/**/*.js`, (err, stdout, stderr) => {
      const eslintReport = { ...payload, eslint: { warnings: stdout } };
      if (err) {
        eslintReport.eslint = { errors: stderr, warnings: stdout };
      }
      //write to db
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

const lintRepo = function (payload) {
  const cloneURL = payload.repository.clone_url;
  const repoName = payload.repository.name;
  const tasks = new Listr([
    {
      title: 'deleting any previous local repo',
      task: () => deleteLocalRepo(repoName),
    },
    {
      title: 'cloning repo',
      task: () => cloneRepo(cloneURL),
    },
    {
      title: 'checking .eslintrc',
      task: () => checkEslintrc(repoName),
    },
    {
      title: 'linting',
      task: () => lint(repoName, payload),
    },
    {
      title: 'deleting local repo',
      task: () => deleteLocalRepo(repoName),
    },
  ]);
  console.log(`Processing ${repoName}`);
  return new Promise((res) => {
    res(tasks.run());
  });
};

module.exports = { lintRepo };
