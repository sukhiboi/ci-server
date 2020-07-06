const createDiv = function (className, status) {
  const div = document.createElement('div');
  if (className) div.className = className;
  div.innerText = status;
  return div;
};

const createResultRow = function (result) {
  const div = document.createElement('div');
  div.className = 'result';
  div.appendChild(createDiv(undefined, result.jobId));
  div.appendChild(createDiv('repoName', result.repoName));
  div.appendChild(createDiv('status', result.lintingStatus));
  div.appendChild(createDiv('status', result.testingStatus));
  return div;
};

const addResults = function (results) {
  const root = document.getElementById('results');
  root.innerHTML = '';
  Object.keys(results)
    .sort((a, b) => b.split('job')[1] - a.split('job')[1])
    .forEach((job) => {
      const div = createResultRow(results[job]);
      root.appendChild(div);
    });
};

const getResults = function () {
  fetch('/details')
    .then((res) => res.json())
    .then((jobs) => addResults(jobs))
    .catch((err) => console.error(err.message));
};

const main = function () {
  getResults();
  setInterval(getResults, 5000);
};

window.onload = main;
