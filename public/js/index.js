const createJobCard = function (job) {
  const {
    commitSHA,
    jobId,
    cloneURL,
    repoName,
    testingStatus,
    lintingStatus,
  } = job;
  const [, id] = jobId.split('job');
  const sha = commitSHA.slice(0, 6);
  const html = `
  <div class="card status-${testingStatus}">
    <div class="card-segment">
      <div class="repo-name"><a href="${cloneURL}">${repoName}</a></div>
      <div class="details">Linting <span>${lintingStatus}</span></div>
      <div class="details">Testing <span>${testingStatus}</span></div>
      <div class="details">SHA <span>${sha}</span></div>
    </div>
    <div class="card-segment">
      <div class="job-id">#${id}</div>
      <div class="details">Waiting time <span>2 min</span></div>
      <div class="details">Execution time <span>2 min</span></div>
    </div>
  </div>
  `;
  return html;
};

const getResults = function () {
  fetch('/results')
    .then((res) => res.json())
    .then((jobs) => {
      const root = document.getElementById('root');
      const jobIds = Object.keys(jobs);
      const sortedJobIds = jobIds.sort((job1, job2) => {
        return job2.split('job')[1] - job1.split('job')[1];
      });
      const rootHTML = sortedJobIds.reduce((html, jobId) => {
        return html + createJobCard(jobs[jobId]);
      }, '');
      root.innerHTML = rootHTML;
    })
    .catch((err) => console.error(err.message));
};

const main = function () {
  getResults();
  setInterval(getResults, 5000);
};

window.onload = main;
