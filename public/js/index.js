const createDiv = function (className, status) {
  const div = document.createElement('div');
  if (className) div.className = className;
  div.innerText = status;
  return div;
};

const diffDates = function (date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  let diff = (d2 - d1) / 1000;
  diff = Math.abs(Math.floor(diff));
  const days = Math.floor(diff / (24 * 60 * 60));
  let leftSec = diff - days * 24 * 60 * 60;
  const hrs = Math.floor(leftSec / (60 * 60));
  leftSec = leftSec - hrs * 60 * 60;
  const min = Math.floor(leftSec / 60);
  leftSec = leftSec - min * 60;
  const minutes = isNaN(min) ? '--' : min;
  const seconds = isNaN(leftSec) ? '--' : leftSec;
  return `${minutes}m ${seconds}s`;
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
