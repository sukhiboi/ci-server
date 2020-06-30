const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { lintRepo } = require('./lint');
const defaultPort = 4000;

app.use(bodyParser.json());
app.post('/github', lintRepo);

const PORT = process.env.PORT || defaultPort;
app.listen(PORT, () => console.log(`listening to ${PORT}`));
