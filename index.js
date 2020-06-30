const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.post('/github', (req, res) => {
  console.log(req.body);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`listening to ${PORT}`));
