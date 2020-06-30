const { readFileSync, existsSync, writeFileSync } = require('fs');
const { exec } = require('child_process');

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
    exec(`cp -r eslint_modules/node_modules ${repoName};`, (err, stdout) => {
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
    res();
  });
};

const lint = function (repoName, response) {
  return new Promise((res) => {
    exec(`cd ${repoName}; eslint *.js`, (err, stdout, stderr) => {
      if (err) {
        response.end(JSON.stringify({ errors: stderr, warnings: stdout }));
      } else {
        response.end(JSON.stringify({ warnings: stdout }));
      }
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

module.exports = {
  cloneRepo,
  installEslint,
  checkEslintrc,
  lint,
  deleteLocalRepo,
};
